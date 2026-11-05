// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HiringClearance
 * @notice SkillMatch DNA v19.0 — Automated Smart Contract Offer Clearing
 * @dev Records candidate offer commitments on-chain and triggers automated
 *      IT provisioning pipeline upon acceptance. Integrates with SkillMatch's
 *      CCRS / PTS verification oracle for transparent, tamper-proof hiring.
 *
 * Architecture:
 *  1. Employer calls issueOffer() with CCRS, PTS, and salary commitment hash
 *  2. Candidate calls acceptOffer() with e-signature payload
 *  3. ProvisioningTriggered event fires → off-chain listener provisions:
 *     - Okta/Entra ID SSO account
 *     - GitHub organization invite
 *     - Slack workspace onboarding
 *     - Hardware shipping order
 */
contract HiringClearance {

    // ------------------------------------------------------------------ //
    // Structs & Enums                                                     //
    // ------------------------------------------------------------------ //

    enum OfferStatus {
        NonExistent,    // 0 — offer does not exist
        Pending,        // 1 — awaiting candidate acceptance
        Accepted,       // 2 — accepted; provisioning triggered
        Revoked,        // 3 — revoked by employer
        Expired         // 4 — past valid_until timestamp
    }

    struct Offer {
        bytes32 offerId;
        address employer;
        bytes32 candidateIdHash;         // keccak256(candidate_id) — privacy-preserving
        bytes32 applicationIdHash;       // keccak256(application_id)
        bytes32 salaryCommitmentHash;    // keccak256(abi.encode(baseSalaryUSD, signingBonusUSD))
        uint256 ccrsX100;                // CCRS * 100 (e.g., 8450 = 84.50%)
        uint256 ptsX100;                 // PTS  * 100
        bytes32 zkProofHash;             // Groth16/BN254 commitment from zk-Proctor
        uint256 validUntil;              // Unix timestamp
        OfferStatus status;
        uint256 issuedAt;
        uint256 acceptedAt;
        bytes32 acceptanceSignatureHash; // keccak256(e-signature payload)
    }

    // ------------------------------------------------------------------ //
    // Events                                                              //
    // ------------------------------------------------------------------ //

    event OfferIssued(
        bytes32 indexed offerId,
        address indexed employer,
        bytes32 candidateIdHash,
        uint256 ccrsX100,
        uint256 ptsX100,
        uint256 validUntil,
        uint256 issuedAt
    );

    event OfferAccepted(
        bytes32 indexed offerId,
        bytes32 candidateIdHash,
        bytes32 acceptanceSignatureHash,
        uint256 acceptedAt
    );

    event ProvisioningTriggered(
        bytes32 indexed offerId,
        bytes32 candidateIdHash,
        address employer,
        uint256 triggeredAt
    );

    event OfferRevoked(
        bytes32 indexed offerId,
        address indexed employer,
        uint256 revokedAt
    );

    // ------------------------------------------------------------------ //
    // State                                                               //
    // ------------------------------------------------------------------ //

    mapping(bytes32 => Offer) private _offers;
    mapping(address => bytes32[]) private _employerOffers;
    uint256 private _totalOffersIssued;
    uint256 private _totalOffersAccepted;

    // Minimum CCRS threshold to issue an offer (80.00% = 8000)
    uint256 public constant MIN_CCRS_X100 = 8000;

    // Minimum PTS threshold to issue an offer (70.00% = 7000)
    uint256 public constant MIN_PTS_X100 = 7000;

    // ------------------------------------------------------------------ //
    // Core Functions                                                      //
    // ------------------------------------------------------------------ //

    /**
     * @notice Issue a new hiring offer with CCRS + PTS attestation.
     * @dev Reverts if CCRS < 80.0% or PTS < 70.0%.
     * @param offerId           Unique offer identifier (bytes32)
     * @param candidateIdHash   keccak256 of the candidate's system ID
     * @param applicationIdHash keccak256 of the application ID
     * @param salaryCommitmentHash  keccak256(abi.encode(baseSalaryUSD, signingBonusUSD))
     * @param ccrsX100          Candidate CCRS * 100 (e.g., 8450 for 84.50%)
     * @param ptsX100           Candidate PTS  * 100 (e.g., 9200 for 92.00%)
     * @param zkProofHash       zk-Proctor Groth16/BN254 commitment hash
     * @param validityDays      Number of days the offer remains open
     */
    function issueOffer(
        bytes32 offerId,
        bytes32 candidateIdHash,
        bytes32 applicationIdHash,
        bytes32 salaryCommitmentHash,
        uint256 ccrsX100,
        uint256 ptsX100,
        bytes32 zkProofHash,
        uint256 validityDays
    ) external {
        require(_offers[offerId].status == OfferStatus.NonExistent, "HiringClearance: offer already exists");
        require(ccrsX100 >= MIN_CCRS_X100, "HiringClearance: CCRS below minimum threshold (80.00%)");
        require(ptsX100  >= MIN_PTS_X100,  "HiringClearance: PTS below minimum threshold (70.00%)");
        require(validityDays >= 1 && validityDays <= 30, "HiringClearance: validity must be 1-30 days");

        uint256 validUntil = block.timestamp + validityDays * 1 days;

        _offers[offerId] = Offer({
            offerId:                offerId,
            employer:               msg.sender,
            candidateIdHash:        candidateIdHash,
            applicationIdHash:      applicationIdHash,
            salaryCommitmentHash:   salaryCommitmentHash,
            ccrsX100:               ccrsX100,
            ptsX100:                ptsX100,
            zkProofHash:            zkProofHash,
            validUntil:             validUntil,
            status:                 OfferStatus.Pending,
            issuedAt:               block.timestamp,
            acceptedAt:             0,
            acceptanceSignatureHash: bytes32(0),
        });

        _employerOffers[msg.sender].push(offerId);
        _totalOffersIssued++;

        emit OfferIssued(
            offerId,
            msg.sender,
            candidateIdHash,
            ccrsX100,
            ptsX100,
            validUntil,
            block.timestamp
        );
    }

    /**
     * @notice Accept an offer. Triggers ProvisioningTriggered event.
     * @param offerId                   The offer identifier to accept
     * @param candidateIdHash           Must match the hash stored in the offer
     * @param acceptanceSignatureHash   keccak256(e-signature or wallet signature payload)
     */
    function acceptOffer(
        bytes32 offerId,
        bytes32 candidateIdHash,
        bytes32 acceptanceSignatureHash
    ) external {
        Offer storage offer = _offers[offerId];
        require(offer.status == OfferStatus.Pending,           "HiringClearance: offer is not pending");
        require(offer.candidateIdHash == candidateIdHash,      "HiringClearance: candidate ID mismatch");
        require(block.timestamp <= offer.validUntil,           "HiringClearance: offer has expired");

        offer.status                 = OfferStatus.Accepted;
        offer.acceptedAt             = block.timestamp;
        offer.acceptanceSignatureHash = acceptanceSignatureHash;
        _totalOffersAccepted++;

        emit OfferAccepted(offerId, candidateIdHash, acceptanceSignatureHash, block.timestamp);
        emit ProvisioningTriggered(offerId, candidateIdHash, offer.employer, block.timestamp);
    }

    /**
     * @notice Revoke a pending offer (employer only).
     */
    function revokeOffer(bytes32 offerId) external {
        Offer storage offer = _offers[offerId];
        require(offer.employer == msg.sender, "HiringClearance: caller is not the employer");
        require(
            offer.status == OfferStatus.Pending,
            "HiringClearance: only pending offers can be revoked"
        );
        offer.status = OfferStatus.Revoked;
        emit OfferRevoked(offerId, msg.sender, block.timestamp);
    }

    // ------------------------------------------------------------------ //
    // View Functions                                                      //
    // ------------------------------------------------------------------ //

    /**
     * @notice Get offer details by ID.
     */
    function getOffer(bytes32 offerId) external view returns (Offer memory) {
        return _offers[offerId];
    }

    /**
     * @notice Get offer status.
     */
    function getOfferStatus(bytes32 offerId) external view returns (OfferStatus) {
        if (
            _offers[offerId].status == OfferStatus.Pending &&
            block.timestamp > _offers[offerId].validUntil
        ) {
            return OfferStatus.Expired;
        }
        return _offers[offerId].status;
    }

    /**
     * @notice Get all offer IDs issued by a given employer.
     */
    function getEmployerOffers(address employer) external view returns (bytes32[] memory) {
        return _employerOffers[employer];
    }

    /**
     * @notice Global statistics.
     */
    function getGlobalStats() external view returns (
        uint256 totalIssued,
        uint256 totalAccepted,
        uint256 acceptanceRateBps   // basis points: acceptanceRate * 10000
    ) {
        totalIssued   = _totalOffersIssued;
        totalAccepted = _totalOffersAccepted;
        acceptanceRateBps = _totalOffersIssued > 0
            ? (_totalOffersAccepted * 10_000) / _totalOffersIssued
            : 0;
    }
}
