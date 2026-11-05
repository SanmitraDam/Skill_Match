// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AutonomousConsortium
 * @notice SkillMatch DNA Version 21.0 — Self-Evolving Autonomous Enterprise Consortia
 * @dev Manages decentralized corporate alliances, automated equity/dividend streaming,
 *      and sub-500ms multi-agent dispute arbitration.
 */
contract AutonomousConsortium {
    address public immutable governanceAuthority;

    enum VentureStatus { PROPOSED, ACTIVE, COMPLETED, DISSOLVED }
    enum DisputeVerdict { PENDING, COMPLAINANT_UPHELD, RESPONDENT_CLEARED, EQUITABLE_SPLIT }

    struct Venture {
        bytes32 ventureId;
        string ventureName;
        address creator;
        uint256 treasuryBalanceWei;
        uint256 activeSquadCount;
        VentureStatus status;
        uint256 createdAt;
    }

    struct ContributorStream {
        address payable contributor;
        uint256 totalDisbursedWei;
        uint256 lastStreamTimestamp;
        uint256 rateWeiPerSecond;
    }

    struct Dispute {
        bytes32 disputeId;
        bytes32 ventureId;
        address complainant;
        address respondent;
        uint256 contestedAmountWei;
        DisputeVerdict verdict;
        bool settled;
    }

    // Storage
    mapping(bytes32 => Venture) public ventures;
    mapping(bytes32 => mapping(address => ContributorStream)) public contributorStreams;
    mapping(bytes32 => Dispute) public disputes;

    // Events
    event VentureCreated(bytes32 indexed ventureId, string ventureName, address indexed creator, uint256 initialTreasury);
    event DividendStreamed(bytes32 indexed ventureId, address indexed contributor, uint256 amountWei);
    event DisputeFiled(bytes32 indexed disputeId, bytes32 indexed ventureId, address complainant, address respondent, uint256 amountWei);
    event DisputeResolved(bytes32 indexed disputeId, DisputeVerdict verdict, uint256 payoutWei);

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Creates an autonomous enterprise venture with pooled treasury capital.
     */
    function createVenture(
        bytes32 ventureId,
        string calldata ventureName
    ) external payable {
        require(ventures[ventureId].createdAt == 0, "Venture exists");

        ventures[ventureId] = Venture({
            ventureId: ventureId,
            ventureName: ventureName,
            creator: msg.sender,
            treasuryBalanceWei: msg.value,
            activeSquadCount: 1,
            status: VentureStatus.ACTIVE,
            createdAt: block.timestamp
        });

        emit VentureCreated(ventureId, ventureName, msg.sender, msg.value);
    }

    /**
     * @notice Registers a contributor dividend stream for PRs and uptime.
     */
    function registerContributorStream(
        bytes32 ventureId,
        address payable contributor,
        uint256 rateWeiPerSecond
    ) external {
        require(ventures[ventureId].status == VentureStatus.ACTIVE, "Inactive venture");
        require(msg.sender == ventures[ventureId].creator || msg.sender == governanceAuthority, "Unauthorized");

        contributorStreams[ventureId][contributor] = ContributorStream({
            contributor: contributor,
            totalDisbursedWei: 0,
            lastStreamTimestamp: block.timestamp,
            rateWeiPerSecond: rateWeiPerSecond
        });
    }

    /**
     * @notice Pulls streamed micro-dividends from venture treasury.
     */
    function claimStreamedDividends(bytes32 ventureId) external {
        ContributorStream storage stream = contributorStreams[ventureId][msg.sender];
        require(stream.contributor == msg.sender, "No active stream");

        uint256 elapsed = block.timestamp - stream.lastStreamTimestamp;
        require(elapsed > 0, "No time elapsed");

        uint256 dividend = elapsed * stream.rateWeiPerSecond;
        Venture storage v = ventures[ventureId];
        require(v.treasuryBalanceWei >= dividend, "Treasury deficit");

        stream.lastStreamTimestamp = block.timestamp;
        stream.totalDisbursedWei += dividend;
        v.treasuryBalanceWei -= dividend;

        stream.contributor.transfer(dividend);
        emit DividendStreamed(ventureId, msg.sender, dividend);
    }

    /**
     * @notice Files an automated dispute for multi-agent arbitration.
     */
    function fileDispute(
        bytes32 disputeId,
        bytes32 ventureId,
        address respondent
    ) external payable {
        require(disputes[disputeId].complainant == address(0), "Dispute exists");
        require(msg.value > 0, "Zero escrow");

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            ventureId: ventureId,
            complainant: msg.sender,
            respondent: respondent,
            contestedAmountWei: msg.value,
            verdict: DisputeVerdict.PENDING,
            settled: false
        });

        emit DisputeFiled(disputeId, ventureId, msg.sender, respondent, msg.value);
    }

    /**
     * @notice Settles dispute based on multi-agent judicial panel verdict.
     */
    function settleDispute(
        bytes32 disputeId,
        DisputeVerdict verdict
    ) external {
        require(msg.sender == governanceAuthority, "Only governance panel");
        Dispute storage d = disputes[disputeId];
        require(!d.settled, "Already settled");

        d.verdict = verdict;
        d.settled = true;

        if (verdict == DisputeVerdict.RESPONDENT_CLEARED) {
            payable(d.respondent).transfer(d.contestedAmountWei);
        } else if (verdict == DisputeVerdict.COMPLAINANT_UPHELD) {
            payable(d.complainant).transfer(d.contestedAmountWei);
        } else {
            uint256 split = d.contestedAmountWei / 2;
            payable(d.complainant).transfer(split);
            payable(d.respondent).transfer(d.contestedAmountWei - split);
        }

        emit DisputeResolved(disputeId, verdict, d.contestedAmountWei);
    }
}
