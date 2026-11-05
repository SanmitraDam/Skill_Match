// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProctoringIntegrityRegistry
 * @notice On-chain immutable registry recording multi-modal AI proctoring sessions,
 *         Proctoring Trust Scores (PTS), vision/acoustic/browser/keystroke incident tallies,
 *         and Ed25519 cryptographic forensic audit log proofs.
 * @dev Part of SkillMatch DNA Version 17.0: Multi-Modal AI Proctoring & Biometric Fraud Detection Architecture.
 */
contract ProctoringIntegrityRegistry {
    enum IntegrityVerdict {
        VERIFIED_AUTHENTIC, // PTS >= 85%
        SOFT_WARNING,       // 60% <= PTS < 85%
        SESSION_QUARANTINED // PTS < 60%
    }

    struct ProctoringSessionRecord {
        bytes32 sessionId;
        address candidateAddress;
        bytes32 voiceEnrollmentHash;   // 192-dim acoustic baseline hash
        bytes32 biometricProfileHash;  // 3D face mesh / typing baseline hash
        uint256 proctoringTrustScoreBps; // scaled by 10000 (e.g. 9120 = 91.20%)
        IntegrityVerdict verdict;
        uint256 visionIncidentsCount;   // multi-face, absent, gaze stray, head turn
        uint256 audioIncidentsCount;    // secondary speaker, whispered prompt, ultrasonic beacon
        uint256 browserIncidentsCount;  // tab switch, blur, devtools tamper, copy-paste lock
        uint256 keystrokeIncidentsCount;// macro injection, anomalous flight-dwell time
        bytes32 ed25519AuditHash;       // Ed25519 cryptographic signature of audit package
        uint256 sessionTimestamp;
        bool isCertified;
    }

    address public immutable governanceAuthority;
    uint256 public totalSessionsAudited;

    mapping(bytes32 => ProctoringSessionRecord) public proctoringSessions;
    mapping(address => bytes32[]) public candidateSessions;

    event ProctoringSessionRecorded(
        bytes32 indexed sessionId,
        address indexed candidate,
        uint256 proctoringTrustScoreBps,
        IntegrityVerdict verdict,
        bytes32 ed25519AuditHash,
        uint256 totalIncidents
    );

    event SessionQuarantined(
        bytes32 indexed sessionId,
        address indexed candidate,
        uint256 proctoringTrustScoreBps,
        string reason
    );

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "ProctoringIntegrityRegistry: unauthorized caller");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Registers a verified multi-modal AI proctoring session record on-chain
     */
    function recordProctoringSession(
        bytes32 sessionId,
        address candidate,
        bytes32 voiceEnrollmentHash,
        bytes32 biometricProfileHash,
        uint256 proctoringTrustScoreBps,
        IntegrityVerdict verdict,
        uint256 visionIncidents,
        uint256 audioIncidents,
        uint256 browserIncidents,
        uint256 keystrokeIncidents,
        bytes32 ed25519AuditHash
    ) external onlyGovernance {
        require(candidate != address(0), "Invalid candidate address");
        require(proctoringSessions[sessionId].sessionTimestamp == 0, "Session already registered");
        require(proctoringTrustScoreBps <= 10000, "PTS score exceeds 100%");

        proctoringSessions[sessionId] = ProctoringSessionRecord({
            sessionId: sessionId,
            candidateAddress: candidate,
            voiceEnrollmentHash: voiceEnrollmentHash,
            biometricProfileHash: biometricProfileHash,
            proctoringTrustScoreBps: proctoringTrustScoreBps,
            verdict: verdict,
            visionIncidentsCount: visionIncidents,
            audioIncidentsCount: audioIncidents,
            browserIncidentsCount: browserIncidents,
            keystrokeIncidentsCount: keystrokeIncidents,
            ed25519AuditHash: ed25519AuditHash,
            sessionTimestamp: block.timestamp,
            isCertified: verdict == IntegrityVerdict.VERIFIED_AUTHENTIC
        });

        candidateSessions[candidate].push(sessionId);
        totalSessionsAudited += 1;

        uint256 totalIncidents = visionIncidents + audioIncidents + browserIncidents + keystrokeIncidents;
        emit ProctoringSessionRecorded(
            sessionId,
            candidate,
            proctoringTrustScoreBps,
            verdict,
            ed25519AuditHash,
            totalIncidents
        );

        if (verdict == IntegrityVerdict.SESSION_QUARANTINED) {
            emit SessionQuarantined(sessionId, candidate, proctoringTrustScoreBps, "PTS fell below quarantine threshold (<60%)");
        }
    }

    /**
     * @notice Retrieves proctoring session audit details by session ID
     */
    function getAuditReport(bytes32 sessionId)
        external
        view
        returns (
            address candidate,
            uint256 ptsScoreBps,
            IntegrityVerdict verdict,
            uint256 visionCount,
            uint256 audioCount,
            uint256 browserCount,
            uint256 keystrokeCount,
            bytes32 auditHash,
            bool certified
        )
    {
        ProctoringSessionRecord memory rec = proctoringSessions[sessionId];
        require(rec.sessionTimestamp != 0, "Session not found");
        return (
            rec.candidateAddress,
            rec.proctoringTrustScoreBps,
            rec.verdict,
            rec.visionIncidentsCount,
            rec.audioIncidentsCount,
            rec.browserIncidentsCount,
            rec.keystrokeIncidentsCount,
            rec.ed25519AuditHash,
            rec.isCertified
        );
    }

    /**
     * @notice Returns all proctoring session IDs associated with a candidate
     */
    function getCandidateSessions(address candidate) external view returns (bytes32[] memory) {
        return candidateSessions[candidate];
    }
}
