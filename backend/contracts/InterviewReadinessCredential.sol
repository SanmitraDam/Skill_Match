// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InterviewReadinessCredential
 * @notice On-chain registry for W3C Verifiable Credentials and Stage 5 Composite Career Readiness Score (CCRS).
 *         Certifies candidates who successfully complete all 5 stages of the SkillMatch Readiness Pipeline:
 *         Stage 1: Match Score >= 60%
 *         Stage 2: Flashcard Completion >= 80%
 *         Stage 3: Adaptive CAT Ability >= 3.5 / 5.0
 *         Stage 4: Voice AI Interview >= 75%
 *         Stage 5: Boardroom Simulation CCRS >= 80% (8000 bps)
 * @dev Part of SkillMatch DNA Version 15.0: Multi-Stage Interview Readiness & Topic-Wise Flashcard Engine.
 */
contract InterviewReadinessCredential {
    struct CandidateCredential {
        bytes32 credentialId;
        address candidateAddress;
        bytes32 zkDIDCommitment;
        string candidateName;
        string targetRole;
        uint256 matchScoreBps; // Stage 1 (min 6000)
        uint256 flashcardMasteryBps; // Stage 2 (min 8000)
        uint256 catAbilityScore; // Stage 3 (scaled by 100, min 350)
        uint256 voiceInterviewBps; // Stage 4 (min 7500)
        uint256 ccrsCertificationBps; // Stage 5 (min 8000)
        uint256 issueTimestamp;
        bool isCertified;
    }

    address public immutable governanceAuthority;
    uint256 public totalCredentialsIssued;

    mapping(bytes32 => CandidateCredential) public credentials;
    mapping(address => bytes32[]) public candidateCredentialIds;

    event CredentialMinted(
        bytes32 indexed credentialId,
        address indexed candidate,
        bytes32 zkDIDCommitment,
        string targetRole,
        uint256 ccrsScoreBps,
        uint256 timestamp
    );

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "InterviewReadinessCredential: unauthorized caller");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Mints an official W3C Verifiable Credential upon completing all 5 pipeline stages
     */
    function issueReadinessCredential(
        address candidate,
        bytes32 zkDIDCommitment,
        string calldata candidateName,
        string calldata targetRole,
        uint256 matchScoreBps,
        uint256 flashcardMasteryBps,
        uint256 catAbilityScore,
        uint256 voiceInterviewBps,
        uint256 ccrsCertificationBps
    ) external onlyGovernance returns (bytes32) {
        // Enforce all 5 pipeline gating thresholds
        require(matchScoreBps >= 6000, "InterviewReadinessCredential: Stage 1 match below 60%");
        require(flashcardMasteryBps >= 8000, "InterviewReadinessCredential: Stage 2 flashcards below 80%");
        require(catAbilityScore >= 350, "InterviewReadinessCredential: Stage 3 CAT ability below 3.5");
        require(voiceInterviewBps >= 7500, "InterviewReadinessCredential: Stage 4 voice interview below 75%");
        require(ccrsCertificationBps >= 8000, "InterviewReadinessCredential: Stage 5 CCRS below 80%");

        bytes32 credentialId = keccak256(
            abi.encodePacked(candidate, zkDIDCommitment, targetRole, block.timestamp, totalCredentialsIssued)
        );

        credentials[credentialId] = CandidateCredential({
            credentialId: credentialId,
            candidateAddress: candidate,
            zkDIDCommitment: zkDIDCommitment,
            candidateName: candidateName,
            targetRole: targetRole,
            matchScoreBps: matchScoreBps,
            flashcardMasteryBps: flashcardMasteryBps,
            catAbilityScore: catAbilityScore,
            voiceInterviewBps: voiceInterviewBps,
            ccrsCertificationBps: ccrsCertificationBps,
            issueTimestamp: block.timestamp,
            isCertified: true
        });

        candidateCredentialIds[candidate].push(credentialId);
        totalCredentialsIssued++;

        emit CredentialMinted(credentialId, candidate, zkDIDCommitment, targetRole, ccrsCertificationBps, block.timestamp);
        return credentialId;
    }

    /**
     * @notice Returns all credential IDs for a given candidate address
     */
    function getCandidateCredentials(address candidate) external view returns (bytes32[] memory) {
        return candidateCredentialIds[candidate];
    }
}
