// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AutonomousEnterprise
 * @dev Governs Zero-Human Corporate Entities: Self-funding, self-governing AI corporate charters,
 * autonomous candidate zkDID hiring, continuous per-block USDC/equity streaming, and AI judicial arbitration.
 */
contract AutonomousEnterprise {
    enum JudicialVerdict { PENDING, FULL_PAYOUT, PARTIAL_PAYOUT, REJECTED, SLASH_DEPOSIT }

    struct EnterpriseCharter {
        bytes32 entityId;
        string entityName;
        string missionCharter;
        address treasuryWallet;
        uint256 treasuryBalanceUSDC;
        uint256 totalEquityShares;
        uint256 activeHiresCount;
        bool isActive;
    }

    struct ActiveHire {
        uint256 hireId;
        bytes32 entityId;
        bytes32 candidateZkDid;
        uint256 ratePerBlockUSDC;
        uint256 equityAllocation;
        uint256 lastStreamedBlock;
        uint256 totalEarnedUSDC;
        bool isTerminated;
    }

    struct JudicialArbitrationCase {
        uint256 caseId;
        uint256 hireId;
        bytes32 commitShaProof;
        uint256 disputeAmountUSDC;
        JudicialVerdict verdict;
        uint256 resolutionTimestamp;
        bool isResolved;
    }

    address public protocolGovernance;
    uint256 public totalEnterprises;
    uint256 public nextHireId = 1;
    uint256 public nextCaseId = 1;

    mapping(bytes32 => EnterpriseCharter) public enterprises;
    mapping(uint256 => ActiveHire) public hires;
    mapping(uint256 => JudicialArbitrationCase) public arbitrationCases;

    event EnterpriseChartered(bytes32 indexed entityId, string entityName, address treasury);
    event CandidateHired(uint256 indexed hireId, bytes32 indexed entityId, bytes32 candidateZkDid, uint256 ratePerBlock);
    event PayrollStreamed(uint256 indexed hireId, bytes32 indexed candidateZkDid, uint256 amountUSDC, uint256 toBlock);
    event DisputeArbitrated(uint256 indexed caseId, uint256 indexed hireId, JudicialVerdict verdict, uint256 payoutAmount);

    modifier onlyGovernance() {
        require(msg.sender == protocolGovernance, "Unauthorized: Not Protocol Governance");
        _;
    }

    constructor() {
        protocolGovernance = msg.sender;
    }

    function charterEnterprise(
        bytes32 entityId,
        string calldata entityName,
        string calldata missionCharter,
        uint256 initialTreasuryUSDC,
        uint256 totalEquityShares
    ) external returns (bytes32) {
        require(enterprises[entityId].entityId == bytes32(0), "Entity ID already chartered");

        enterprises[entityId] = EnterpriseCharter({
            entityId: entityId,
            entityName: entityName,
            missionCharter: missionCharter,
            treasuryWallet: msg.sender,
            treasuryBalanceUSDC: initialTreasuryUSDC,
            totalEquityShares: totalEquityShares,
            activeHiresCount: 0,
            isActive: true
        });

        totalEnterprises++;
        emit EnterpriseChartered(entityId, entityName, msg.sender);
        return entityId;
    }

    function hireCandidate(
        bytes32 entityId,
        bytes32 candidateZkDid,
        uint256 ratePerBlockUSDC,
        uint256 equityAllocation
    ) external returns (uint256) {
        EnterpriseCharter storage ent = enterprises[entityId];
        require(ent.isActive, "Enterprise not active");

        uint256 hireId = nextHireId++;
        hires[hireId] = ActiveHire({
            hireId: hireId,
            entityId: entityId,
            candidateZkDid: candidateZkDid,
            ratePerBlockUSDC: ratePerBlockUSDC,
            equityAllocation: equityAllocation,
            lastStreamedBlock: block.number,
            totalEarnedUSDC: 0,
            isTerminated: false
        });

        ent.activeHiresCount++;
        emit CandidateHired(hireId, entityId, candidateZkDid, ratePerBlockUSDC);
        return hireId;
    }

    function streamPayroll(uint256 hireId) external returns (uint256 payout) {
        ActiveHire storage hire = hires[hireId];
        require(!hire.isTerminated, "Hire terminated");
        require(block.number > hire.lastStreamedBlock, "Blocks not elapsed");

        EnterpriseCharter storage ent = enterprises[hire.entityId];
        uint256 blocksElapsed = block.number - hire.lastStreamedBlock;
        payout = blocksElapsed * hire.ratePerBlockUSDC;

        if (payout > ent.treasuryBalanceUSDC) {
            payout = ent.treasuryBalanceUSDC;
        }

        ent.treasuryBalanceUSDC -= payout;
        hire.totalEarnedUSDC += payout;
        hire.lastStreamedBlock = block.number;

        emit PayrollStreamed(hireId, hire.candidateZkDid, payout, block.number);
        return payout;
    }

    function arbitrateDispute(
        uint256 hireId,
        bytes32 commitShaProof,
        uint256 disputeAmountUSDC,
        JudicialVerdict verdict
    ) external returns (uint256 caseId) {
        caseId = nextCaseId++;
        arbitrationCases[caseId] = JudicialArbitrationCase({
            caseId: caseId,
            hireId: hireId,
            commitShaProof: commitShaProof,
            disputeAmountUSDC: disputeAmountUSDC,
            verdict: verdict,
            resolutionTimestamp: block.timestamp,
            isResolved: true
        });

        emit DisputeArbitrated(caseId, hireId, verdict, disputeAmountUSDC);
        return caseId;
    }
}
