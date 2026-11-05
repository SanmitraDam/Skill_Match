// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TalentExchange
 * @notice SkillMatch DNA Version 21.0 — Autonomous Global Talent Liquidity Exchange
 * @dev Decentralized continuous double-auction (CDA) order book, dynamic spot rate discovery,
 *      block-by-block micro-payout escrows, and skill yield staking pools.
 */
contract TalentExchange {
    address public immutable governanceAuthority;

    enum OrderType { DEMAND, SUPPLY }
    enum OrderStatus { ACTIVE, FILLED, CANCELLED }

    struct Order {
        bytes32 orderId;
        address payable creator;
        OrderType orderType;
        bytes32 skillHash;
        uint256 rateWei;
        uint256 hoursTotal;
        uint256 hoursFilled;
        uint256 escrowLockedWei;
        OrderStatus status;
        uint256 createdAt;
    }

    struct StakingPosition {
        bytes32 positionId;
        address staker;
        bytes32 skillHash;
        uint256 stakedAmountWei;
        uint256 lastClaimedTimestamp;
        uint256 apyBasisPoints; // e.g. 1200 = 12.00%
    }

    // Storage
    mapping(bytes32 => Order) public orders;
    mapping(bytes32 => StakingPosition) public stakingPositions;
    mapping(bytes32 => uint256) public skillSpotRatesWei;

    // Events
    event OrderPlaced(bytes32 indexed orderId, address indexed creator, OrderType orderType, bytes32 indexed skillHash, uint256 rateWei, uint256 hoursTotal);
    event OrderMatched(bytes32 indexed demandOrderId, bytes32 indexed supplyOrderId, uint256 clearedRateWei, uint256 hoursTraded, uint256 totalPayoutWei);
    event MicroPayoutDisbursed(bytes32 indexed orderId, address indexed candidate, uint256 amountWei);
    event SkillStaked(bytes32 indexed positionId, address indexed staker, bytes32 indexed skillHash, uint256 amountWei, uint256 apyBasisPoints);
    event YieldClaimed(bytes32 indexed positionId, address indexed staker, uint256 yieldWei);

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Places an enterprise demand order with locked escrow.
     */
    function placeDemandOrder(
        bytes32 orderId,
        bytes32 skillHash,
        uint256 maxRateWei,
        uint256 hoursNeeded
    ) external payable {
        require(orders[orderId].createdAt == 0, "Order ID exists");
        require(msg.value >= maxRateWei * hoursNeeded, "Insufficient escrow funding");

        orders[orderId] = Order({
            orderId: orderId,
            creator: payable(msg.sender),
            orderType: OrderType.DEMAND,
            skillHash: skillHash,
            rateWei: maxRateWei,
            hoursTotal: hoursNeeded,
            hoursFilled: 0,
            escrowLockedWei: msg.value,
            status: OrderStatus.ACTIVE,
            createdAt: block.timestamp
        });

        emit OrderPlaced(orderId, msg.sender, OrderType.DEMAND, skillHash, maxRateWei, hoursNeeded);
    }

    /**
     * @notice Places a candidate skill supply offer.
     */
    function placeSupplyOffer(
        bytes32 offerId,
        bytes32 skillHash,
        uint256 minRateWei,
        uint256 availableHours
    ) external {
        require(orders[offerId].createdAt == 0, "Offer ID exists");

        orders[offerId] = Order({
            orderId: offerId,
            creator: payable(msg.sender),
            orderType: OrderType.SUPPLY,
            skillHash: skillHash,
            rateWei: minRateWei,
            hoursTotal: availableHours,
            hoursFilled: 0,
            escrowLockedWei: 0,
            status: OrderStatus.ACTIVE,
            createdAt: block.timestamp
        });

        emit OrderPlaced(offerId, msg.sender, OrderType.SUPPLY, skillHash, minRateWei, availableHours);
    }

    /**
     * @notice Executes Continuous Double Auction trade match.
     */
    function matchOrders(
        bytes32 demandId,
        bytes32 supplyId,
        uint256 hoursToTrade
    ) external {
        Order storage d = orders[demandId];
        Order storage s = orders[supplyId];

        require(d.status == OrderStatus.ACTIVE && s.status == OrderStatus.ACTIVE, "Inactive order");
        require(d.skillHash == s.skillHash, "Skill mismatch");
        require(d.rateWei >= s.rateWei, "Bid below ask");

        uint256 clearedRate = (d.rateWei + s.rateWei) / 2;
        skillSpotRatesWei[d.skillHash] = clearedRate;

        uint256 totalPayout = clearedRate * hoursToTrade;
        require(d.escrowLockedWei >= totalPayout, "Escrow deficit");

        d.hoursFilled += hoursToTrade;
        s.hoursFilled += hoursToTrade;
        d.escrowLockedWei -= totalPayout;

        if (d.hoursFilled >= d.hoursTotal) d.status = OrderStatus.FILLED;
        if (s.hoursFilled >= s.hoursTotal) s.status = OrderStatus.FILLED;

        // Disburse payout directly to candidate wallet
        s.creator.transfer(totalPayout);

        emit OrderMatched(demandId, supplyId, clearedRate, hoursToTrade, totalPayout);
    }

    /**
     * @notice Stakes verified skill vector into liquidity pool for passive APY.
     */
    function stakeSkillVector(
        bytes32 positionId,
        bytes32 skillHash,
        uint256 apyBasisPoints
    ) external payable {
        require(msg.value > 0, "Zero stake");
        require(stakingPositions[positionId].stakedAmountWei == 0, "Position exists");

        stakingPositions[positionId] = StakingPosition({
            positionId: positionId,
            staker: msg.sender,
            skillHash: skillHash,
            stakedAmountWei: msg.value,
            lastClaimedTimestamp: block.timestamp,
            apyBasisPoints: apyBasisPoints
        });

        emit SkillStaked(positionId, msg.sender, skillHash, msg.value, apyBasisPoints);
    }

    /**
     * @notice Claims accrued yield on staked skill vector.
     */
    function claimYield(bytes32 positionId) external {
        StakingPosition storage pos = stakingPositions[positionId];
        require(pos.staker == msg.sender, "Unauthorized");

        uint256 elapsed = block.timestamp - pos.lastClaimedTimestamp;
        require(elapsed > 0, "No time elapsed");

        uint256 yieldWei = (pos.stakedAmountWei * pos.apyBasisPoints * elapsed) / (10000 * 365 days);
        pos.lastClaimedTimestamp = block.timestamp;

        if (yieldWei > 0 && address(this).balance >= yieldWei) {
            payable(msg.sender).transfer(yieldWei);
            emit YieldClaimed(positionId, msg.sender, yieldWei);
        }
    }
}
