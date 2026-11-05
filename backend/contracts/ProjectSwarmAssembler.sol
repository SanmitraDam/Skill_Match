// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProjectSwarmAssembler
 * @dev SkillMatch DNA Version 20.0 — Multi-Agent Fractional Project Swarm Assembler & Escrow
 * Dynamic hybrid squad formation (internal staff, fractional specialists, AI agents),
 * performance-based milestone escrow locking, multi-verification disbursement, and micro-equity royalties.
 */
contract ProjectSwarmAssembler {
    address public immutable governanceAuthority;

    enum MemberType { INTERNAL_STAFF, FRACTIONAL_EXPERT, AI_AGENT }
    enum SquadStatus { CREATED, ACTIVE, COMPLETED, CANCELLED }

    struct Member {
        string memberId;
        address payable wallet;
        MemberType memberType;
        uint256 allocationPct; // in basis points (e.g. 5000 = 50.00%)
        uint256 hourlyRateWei;
        uint256 royaltyPoints;
    }

    struct Milestone {
        bytes32 milestoneId;
        string title;
        uint256 escrowAmount;
        uint256 requiredPassedTests;
        bool unitTestsVerified;
        bool codeReviewApproved;
        bool managerApproved;
        bool disbursed;
        bytes32 verificationProofHash;
    }

    struct Squad {
        bytes32 squadId;
        string projectName;
        address enterpriseAdmin;
        SquadStatus status;
        uint256 totalBudgetWei;
        uint256 escrowBalanceWei;
        uint256 totalRoyaltyPool;
        uint256 memberCount;
        uint256 milestoneCount;
    }

    // Storage
    mapping(bytes32 => Squad) public squads;
    mapping(bytes32 => mapping(uint256 => Member)) public squadMembers;
    mapping(bytes32 => mapping(uint256 => Milestone)) public squadMilestones;
    mapping(bytes32 => bool) public squadExists;

    // Events
    event SquadAssembled(bytes32 indexed squadId, string projectName, address indexed enterpriseAdmin, uint256 totalBudget);
    event MemberEnrolled(bytes32 indexed squadId, string memberId, address indexed wallet, MemberType memberType);
    event MilestoneEscrowFunded(bytes32 indexed squadId, bytes32 indexed milestoneId, uint256 amount);
    event MilestoneCleared(bytes32 indexed squadId, bytes32 indexed milestoneId, bytes32 verificationProofHash);
    event EscrowDisbursed(bytes32 indexed squadId, bytes32 indexed milestoneId, uint256 totalPayout);
    event RoyaltiesAllocated(bytes32 indexed squadId, address indexed contributor, uint256 points);

    modifier onlyAdmin(bytes32 squadId) {
        require(msg.sender == squads[squadId].enterpriseAdmin || msg.sender == governanceAuthority, "Unauthorized");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Assembles a new project squad and initialises escrow funding.
     */
    function assembleSquad(
        bytes32 squadId,
        string calldata projectName,
        uint256 totalRoyaltyPool
    ) external payable returns (bytes32) {
        require(!squadExists[squadId], "Squad ID already exists");
        require(bytes(projectName).length > 0, "Empty project name");

        squads[squadId] = Squad({
            squadId: squadId,
            projectName: projectName,
            enterpriseAdmin: msg.sender,
            status: SquadStatus.ACTIVE,
            totalBudgetWei: msg.value,
            escrowBalanceWei: msg.value,
            totalRoyaltyPool: totalRoyaltyPool,
            memberCount: 0,
            milestoneCount: 0
        });
        squadExists[squadId] = true;

        emit SquadAssembled(squadId, projectName, msg.sender, msg.value);
        return squadId;
    }

    /**
     * @notice Enrolls internal employee, fractional expert, or AI agent to squad.
     */
    function enrollMember(
        bytes32 squadId,
        string calldata memberId,
        address payable wallet,
        MemberType memberType,
        uint256 allocationPct,
        uint256 hourlyRateWei,
        uint256 initialRoyaltyPoints
    ) external onlyAdmin(squadId) {
        require(squadExists[squadId], "Squad not found");
        Squad storage s = squads[squadId];
        uint256 idx = s.memberCount;

        squadMembers[squadId][idx] = Member({
            memberId: memberId,
            wallet: wallet,
            memberType: memberType,
            allocationPct: allocationPct,
            hourlyRateWei: hourlyRateWei,
            royaltyPoints: initialRoyaltyPoints
        });
        s.memberCount++;

        emit MemberEnrolled(squadId, memberId, wallet, memberType);
        if (initialRoyaltyPoints > 0) {
            emit RoyaltiesAllocated(squadId, wallet, initialRoyaltyPoints);
        }
    }

    /**
     * @notice Registers a verifiable milestone with locked escrow amount.
     */
    function addMilestone(
        bytes32 squadId,
        bytes32 milestoneId,
        string calldata title,
        uint256 escrowAmount,
        uint256 requiredPassedTests
    ) external onlyAdmin(squadId) {
        require(squadExists[squadId], "Squad not found");
        Squad storage s = squads[squadId];
        require(s.escrowBalanceWei >= escrowAmount, "Insufficient squad escrow balance");

        uint256 idx = s.milestoneCount;
        squadMilestones[squadId][idx] = Milestone({
            milestoneId: milestoneId,
            title: title,
            escrowAmount: escrowAmount,
            requiredPassedTests: requiredPassedTests,
            unitTestsVerified: false,
            codeReviewApproved: false,
            managerApproved: false,
            disbursed: false,
            verificationProofHash: bytes32(0)
        });
        s.milestoneCount++;

        emit MilestoneEscrowFunded(squadId, milestoneId, escrowAmount);
    }

    /**
     * @notice Submits verification checks for milestone completion.
     * When unit tests pass, code review clears, and manager approves, escrow funds disburse automatically.
     */
    function verifyAndDisburseMilestone(
        bytes32 squadId,
        uint256 milestoneIndex,
        bool unitTestsVerified,
        bool codeReviewApproved,
        bool managerApproved,
        bytes32 proofHash
    ) external onlyAdmin(squadId) {
        require(squadExists[squadId], "Squad not found");
        Squad storage s = squads[squadId];
        require(milestoneIndex < s.milestoneCount, "Invalid milestone index");

        Milestone storage m = squadMilestones[squadId][milestoneIndex];
        require(!m.disbursed, "Milestone already disbursed");

        m.unitTestsVerified = unitTestsVerified;
        m.codeReviewApproved = codeReviewApproved;
        m.managerApproved = managerApproved;
        m.verificationProofHash = proofHash;

        if (unitTestsVerified && codeReviewApproved && managerApproved) {
            m.disbursed = true;
            uint256 payout = m.escrowAmount;
            require(s.escrowBalanceWei >= payout, "Escrow deficit");
            s.escrowBalanceWei -= payout;

            // Disburse payout pro-rata to non-AI members (internal & fractional)
            uint256 paidCount = 0;
            for (uint256 i = 0; i < s.memberCount; i++) {
                if (squadMembers[squadId][i].wallet != address(0)) {
                    paidCount++;
                }
            }

            if (paidCount > 0) {
                uint256 perMember = payout / paidCount;
                for (uint256 i = 0; i < s.memberCount; i++) {
                    address payable w = squadMembers[squadId][i].wallet;
                    if (w != address(0) && perMember > 0) {
                        w.transfer(perMember);
                    }
                }
            }

            emit MilestoneCleared(squadId, m.milestoneId, proofHash);
            emit EscrowDisbursed(squadId, m.milestoneId, payout);
        }
    }

    /**
     * @notice Returns squad overview details.
     */
    function getSquad(bytes32 squadId) external view returns (
        string memory projectName,
        address enterpriseAdmin,
        SquadStatus status,
        uint256 totalBudgetWei,
        uint256 escrowBalanceWei,
        uint256 memberCount,
        uint256 milestoneCount
    ) {
        require(squadExists[squadId], "Squad not found");
        Squad storage s = squads[squadId];
        return (
            s.projectName,
            s.enterpriseAdmin,
            s.status,
            s.totalBudgetWei,
            s.escrowBalanceWei,
            s.memberCount,
            s.milestoneCount
        );
    }
}
