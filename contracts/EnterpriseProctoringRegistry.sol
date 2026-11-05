// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnterpriseProctoringRegistry
 * @notice On-chain immutable enterprise compliance registry recording Zero-Knowledge
 *         zk-SNARK proctoring integrity proofs, TPM 2.0 / Apple Secure Enclave hardware
 *         attestation credentials, and automated dispute resolution / appeal lifecycles.
 * @dev Part of SkillMatch DNA Version 18.0: Enterprise Proctoring Compliance & Governance Architecture.
 */
contract EnterpriseProctoringRegistry {
    enum AppealStatus {
        NONE,
        APPEAL_PENDING,
        AI_RE_EVALUATED,
        HUMAN_COMMITTEE_APPROVED,
        APPEAL_REJECTED
    }

    struct ZKProofCommitment {
        bytes32 proofHash;
        bytes32 candidateDIDHash;
        bytes32 sessionHash;
        uint256 ptsThresholdBps; // scaled by 10000 (e.g. 9000 = 90.00%)
        bool isVerified;
        uint256 verifiedTimestamp;
    }

    struct HardwareAttestationRecord {
        bytes32 deviceAttestationHash;
        string platformAuthenticator; // "Apple Secure Enclave" | "Windows Hello TPM 2.0" | "FIDO2 Key"
        bool hypervisorDetected;
        bool isHardwareRootOfTrust;
        uint256 attestationTimestamp;
    }

    struct DisputeAppealRecord {
        bytes32 appealId;
        bytes32 sessionId;
        address candidateAddress;
        string reasonCategory; // e.g. "AMBIENT_INTERFERENCE", "NETWORK_FLAP", "FALSE_GAZE_TRIGGER"
        string explanationText;
        uint256 originalPtsScoreBps;
        uint256 calibratedPtsScoreBps;
        AppealStatus status;
        uint256 appealTimestamp;
        uint256 resolutionTimestamp;
    }

    struct EnterpriseComplianceReport {
        bytes32 sessionId;
        address candidateAddress;
        uint256 rawCcrsBps;
        uint256 finalCalibratedCcrsBps;
        bytes32 zkProofHash;
        bytes32 ed25519ComplianceCertHash;
        bool gdprBipaPurged;
        uint256 certifiedTimestamp;
    }

    address public immutable governanceAuthority;
    uint256 public totalZKProofsCommitted;
    uint256 public totalDisputesProcessed;

    mapping(bytes32 => ZKProofCommitment) public zkProofs;
    mapping(bytes32 => HardwareAttestationRecord) public hardwareAttestations;
    mapping(bytes32 => DisputeAppealRecord) public disputeAppeals;
    mapping(bytes32 => EnterpriseComplianceReport) public complianceReports;
    mapping(address => bytes32[]) public candidateAppeals;

    event ZKProofCommitted(
        bytes32 indexed sessionHash,
        bytes32 indexed candidateDIDHash,
        bytes32 proofHash,
        uint256 ptsThresholdBps
    );

    event HardwareAttestationRecorded(
        bytes32 indexed sessionId,
        string platformAuthenticator,
        bool isHardwareRootOfTrust
    );

    event DisputeAppealed(
        bytes32 indexed appealId,
        bytes32 indexed sessionId,
        address indexed candidate,
        string reasonCategory
    );

    event DisputeResolved(
        bytes32 indexed appealId,
        bytes32 indexed sessionId,
        AppealStatus status,
        uint256 calibratedPtsScoreBps
    );

    event ComplianceCertified(
        bytes32 indexed sessionId,
        address indexed candidate,
        uint256 finalCalibratedCcrsBps,
        bytes32 certHash
    );

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "EnterpriseProctoringRegistry: unauthorized caller");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Commits an 8KB client-side zk-SNARK Groth16 / Plonky2 proof verification on-chain
     */
    function commitZKProof(
        bytes32 sessionHash,
        bytes32 candidateDIDHash,
        bytes32 proofHash,
        uint256 ptsThresholdBps,
        bool isVerified
    ) external onlyGovernance {
        require(zkProofs[sessionHash].verifiedTimestamp == 0, "Proof already committed for session");
        require(ptsThresholdBps <= 10000, "PTS threshold invalid");

        zkProofs[sessionHash] = ZKProofCommitment({
            proofHash: proofHash,
            candidateDIDHash: candidateDIDHash,
            sessionHash: sessionHash,
            ptsThresholdBps: ptsThresholdBps,
            isVerified: isVerified,
            verifiedTimestamp: block.timestamp
        });

        totalZKProofsCommitted += 1;
        emit ZKProofCommitted(sessionHash, candidateDIDHash, proofHash, ptsThresholdBps);
    }

    /**
     * @notice Records TPM 2.0 / Apple Secure Enclave hardware root-of-trust attestation
     */
    function recordHardwareAttestation(
        bytes32 sessionId,
        bytes32 deviceAttestationHash,
        string calldata platformAuthenticator,
        bool hypervisorDetected,
        bool isHardwareRootOfTrust
    ) external onlyGovernance {
        hardwareAttestations[sessionId] = HardwareAttestationRecord({
            deviceAttestationHash: deviceAttestationHash,
            platformAuthenticator: platformAuthenticator,
            hypervisorDetected: hypervisorDetected,
            isHardwareRootOfTrust: isHardwareRootOfTrust,
            attestationTimestamp: block.timestamp
        });

        emit HardwareAttestationRecorded(sessionId, platformAuthenticator, isHardwareRootOfTrust);
    }

    /**
     * @notice Submits an appeal for a non-fatal proctoring anomaly incident
     */
    function submitDisputeAppeal(
        bytes32 appealId,
        bytes32 sessionId,
        address candidate,
        string calldata reasonCategory,
        string calldata explanationText,
        uint256 originalPtsScoreBps
    ) external onlyGovernance {
        require(candidate != address(0), "Invalid candidate");
        require(disputeAppeals[appealId].appealTimestamp == 0, "Appeal already exists");

        disputeAppeals[appealId] = DisputeAppealRecord({
            appealId: appealId,
            sessionId: sessionId,
            candidateAddress: candidate,
            reasonCategory: reasonCategory,
            explanationText: explanationText,
            originalPtsScoreBps: originalPtsScoreBps,
            calibratedPtsScoreBps: originalPtsScoreBps,
            status: AppealStatus.APPEAL_PENDING,
            appealTimestamp: block.timestamp,
            resolutionTimestamp: 0
        });

        candidateAppeals[candidate].push(appealId);
        totalDisputesProcessed += 1;

        emit DisputeAppealed(appealId, sessionId, candidate, reasonCategory);
    }

    /**
     * @notice Resolves an appeal via AI context re-evaluation or HITL committee decision
     */
    function resolveDisputeAppeal(
        bytes32 appealId,
        AppealStatus status,
        uint256 calibratedPtsScoreBps
    ) external onlyGovernance {
        DisputeAppealRecord storage rec = disputeAppeals[appealId];
        require(rec.appealTimestamp != 0, "Appeal not found");

        rec.status = status;
        rec.calibratedPtsScoreBps = calibratedPtsScoreBps;
        rec.resolutionTimestamp = block.timestamp;

        emit DisputeResolved(appealId, rec.sessionId, status, calibratedPtsScoreBps);
    }

    /**
     * @notice Records final enterprise compliance certification with safety multiplier calibrated CCRS
     */
    function recordComplianceCertification(
        bytes32 sessionId,
        address candidate,
        uint256 rawCcrsBps,
        uint256 finalCalibratedCcrsBps,
        bytes32 zkProofHash,
        bytes32 ed25519ComplianceCertHash
    ) external onlyGovernance {
        complianceReports[sessionId] = EnterpriseComplianceReport({
            sessionId: sessionId,
            candidateAddress: candidate,
            rawCcrsBps: rawCcrsBps,
            finalCalibratedCcrsBps: finalCalibratedCcrsBps,
            zkProofHash: zkProofHash,
            ed25519ComplianceCertHash: ed25519ComplianceCertHash,
            gdprBipaPurged: true,
            certifiedTimestamp: block.timestamp
        });

        emit ComplianceCertified(sessionId, candidate, finalCalibratedCcrsBps, ed25519ComplianceCertHash);
    }

    /**
     * @notice Retrieves enterprise compliance report for a candidate session
     */
    function getComplianceReport(bytes32 sessionId)
        external
        view
        returns (
            address candidate,
            uint256 rawCcrsBps,
            uint256 finalCalibratedCcrsBps,
            bytes32 zkProofHash,
            bytes32 ed25519CertHash,
            bool gdprBipaPurged,
            uint256 timestamp
        )
    {
        EnterpriseComplianceReport memory rep = complianceReports[sessionId];
        require(rep.certifiedTimestamp != 0, "Report not found");
        return (
            rep.candidateAddress,
            rep.rawCcrsBps,
            rep.finalCalibratedCcrsBps,
            rep.zkProofHash,
            rep.ed25519ComplianceCertHash,
            rep.gdprBipaPurged,
            rep.certifiedTimestamp
        );
    }

    /**
     * @notice Retrieves all appeal IDs for a candidate
     */
    function getCandidateAppeals(address candidate) external view returns (bytes32[] memory) {
        return candidateAppeals[candidate];
    }
}
