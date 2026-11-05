// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InterviewForensicsRegistry
 * @notice On-chain immutable registry recording post-interview forensic audit diagnostics,
 *         AST asymptotic complexity verifications, STAR method behavioral compliance scores,
 *         composure indices, and closed-loop dynamic remediation sync hashes.
 * @dev Part of SkillMatch DNA Version 16.0: Live Coding Sandbox, Behavioral Analytics & Forensic Diagnostics.
 */
contract InterviewForensicsRegistry {
    struct ForensicAuditRecord {
        bytes32 auditId;
        address candidateAddress;
        bytes32 zkDIDCommitment;
        string roleTarget;
        uint256 technicalCodeScoreBps; // scaled by 10000 (e.g. 8850 = 88.50%)
        string astTimeComplexity; // e.g. "O(N log N)"
        uint256 starBehavioralScoreBps; // scaled by 10000 (e.g. 9200 = 92.00%)
        uint256 composureIndexBps; // scaled by 10000 (e.g. 8700 = 87.00%)
        bytes32 remediationSyncHash; // hash of overridden SM-2 queue and roadmap shift
        uint256 auditTimestamp;
        bool isCertified;
    }

    address public immutable governanceAuthority;
    uint256 public totalAuditsRegistered;

    mapping(bytes32 => ForensicAuditRecord) public forensicAudits;
    mapping(address => bytes32[]) public candidateAudits;

    event ForensicAuditRegistered(
        bytes32 indexed auditId,
        address indexed candidate,
        bytes32 zkDIDCommitment,
        uint256 technicalCodeScoreBps,
        uint256 starBehavioralScoreBps,
        bytes32 remediationSyncHash
    );

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "InterviewForensicsRegistry: unauthorized caller");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Registers an immutable post-interview forensic audit diagnostic record on-chain
     */
    function recordForensicAudit(
        address candidate,
        bytes32 zkDIDCommitment,
        string calldata roleTarget,
        uint256 technicalCodeScoreBps,
        string calldata astTimeComplexity,
        uint256 starBehavioralScoreBps,
        uint256 composureIndexBps,
        bytes32 remediationSyncHash
    ) external onlyGovernance returns (bytes32) {
        bytes32 auditId = keccak256(
            abi.encodePacked(
                candidate,
                zkDIDCommitment,
                roleTarget,
                block.timestamp,
                totalAuditsRegistered
            )
        );

        forensicAudits[auditId] = ForensicAuditRecord({
            auditId: auditId,
            candidateAddress: candidate,
            zkDIDCommitment: zkDIDCommitment,
            roleTarget: roleTarget,
            technicalCodeScoreBps: technicalCodeScoreBps,
            astTimeComplexity: astTimeComplexity,
            starBehavioralScoreBps: starBehavioralScoreBps,
            composureIndexBps: composureIndexBps,
            remediationSyncHash: remediationSyncHash,
            auditTimestamp: block.timestamp,
            isCertified: true
        });

        candidateAudits[candidate].push(auditId);
        totalAuditsRegistered++;

        emit ForensicAuditRegistered(
            auditId,
            candidate,
            zkDIDCommitment,
            technicalCodeScoreBps,
            starBehavioralScoreBps,
            remediationSyncHash
        );
        return auditId;
    }

    /**
     * @notice Retrieves all forensic audit IDs for a candidate
     */
    function getCandidateAudits(address candidate) external view returns (bytes32[] memory) {
        return candidateAudits[candidate];
    }
}
