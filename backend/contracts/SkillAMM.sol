// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillAMM
 * @dev Automated Market Maker (AMM) for Decentralized Skill Token Liquidity (SkillSwap Protocol).
 * Governs constant-product (x * y = k) skill token pools, candidate passive yield distribution,
 * and enterprise skill asset licensing.
 */
contract SkillAMM {
    struct SkillPool {
        bytes32 poolId;
        bytes32 skillTokenId;
        string skillName;
        bytes32 candidateZkDid;
        uint256 reserveSkillTokens;
        uint256 reserveUSDC;
        uint256 totalLPShares;
        uint256 accumulatedYieldUSDC;
        uint256 swapFeeBps; // 30 = 0.3%
        bool isActive;
    }

    address public feeCollector;
    uint256 public totalPools;
    mapping(bytes32 => SkillPool) public pools;
    mapping(bytes32 => mapping(bytes32 => uint256)) public lpBalances; // poolId => (providerZkDid => shares)

    event PoolCreated(bytes32 indexed poolId, bytes32 indexed skillTokenId, string skillName, bytes32 candidateZkDid);
    event LiquidityAdded(bytes32 indexed poolId, bytes32 indexed providerZkDid, uint256 skillAdded, uint256 usdcAdded, uint256 sharesMinted);
    event SkillSwapped(bytes32 indexed poolId, bytes32 buyerZkDid, uint256 usdcIn, uint256 skillOut, uint256 feePaid);
    event YieldClaimed(bytes32 indexed poolId, bytes32 indexed candidateZkDid, uint256 yieldAmountUSDC);

    constructor() {
        feeCollector = msg.sender;
    }

    function createPool(
        bytes32 skillTokenId,
        string calldata skillName,
        bytes32 candidateZkDid,
        uint256 initialSkillReserve,
        uint256 initialUSDCReserve
    ) external returns (bytes32 poolId) {
        require(initialSkillReserve > 0 && initialUSDCReserve > 0, "Reserves must be positive");
        poolId = keccak256(abi.encodePacked(skillTokenId, candidateZkDid, block.timestamp));
        require(!pools[poolId].isActive, "Pool already exists");

        uint256 initialShares = initialSkillReserve * initialUSDCReserve;

        pools[poolId] = SkillPool({
            poolId: poolId,
            skillTokenId: skillTokenId,
            skillName: skillName,
            candidateZkDid: candidateZkDid,
            reserveSkillTokens: initialSkillReserve,
            reserveUSDC: initialUSDCReserve,
            totalLPShares: initialShares,
            accumulatedYieldUSDC: 0,
            swapFeeBps: 30, // 0.3%
            isActive: true
        });

        lpBalances[poolId][candidateZkDid] = initialShares;
        totalPools++;

        emit PoolCreated(poolId, skillTokenId, skillName, candidateZkDid);
        return poolId;
    }

    function addLiquidity(
        bytes32 poolId,
        bytes32 providerZkDid,
        uint256 skillAmount,
        uint256 usdcAmount
    ) external returns (uint256 sharesMinted) {
        SkillPool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");

        sharesMinted = (skillAmount * pool.totalLPShares) / pool.reserveSkillTokens;
        require(sharesMinted > 0, "Zero shares minted");

        pool.reserveSkillTokens += skillAmount;
        pool.reserveUSDC += usdcAmount;
        pool.totalLPShares += sharesMinted;
        lpBalances[poolId][providerZkDid] += sharesMinted;

        emit LiquidityAdded(poolId, providerZkDid, skillAmount, usdcAmount, sharesMinted);
        return sharesMinted;
    }

    function swapUSDCForSkill(
        bytes32 poolId,
        bytes32 buyerZkDid,
        uint256 usdcIn
    ) external returns (uint256 skillOut) {
        SkillPool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");

        uint256 fee = (usdcIn * pool.swapFeeBps) / 10000;
        uint256 usdcInNet = usdcIn - fee;

        // Constant-product: (x + dx) * (y - dy) = x * y
        uint256 numerator = usdcInNet * pool.reserveSkillTokens;
        uint256 denominator = pool.reserveUSDC + usdcInNet;
        skillOut = numerator / denominator;
        require(skillOut > 0 && skillOut < pool.reserveSkillTokens, "Insufficient output liquidity");

        pool.reserveUSDC += usdcIn;
        pool.reserveSkillTokens -= skillOut;
        pool.accumulatedYieldUSDC += fee;

        emit SkillSwapped(poolId, buyerZkDid, usdcIn, skillOut, fee);
        return skillOut;
    }

    function claimYield(bytes32 poolId, bytes32 candidateZkDid) external returns (uint256 yieldPaid) {
        SkillPool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        require(pool.candidateZkDid == candidateZkDid, "Not pool creator candidate");

        yieldPaid = pool.accumulatedYieldUSDC;
        require(yieldPaid > 0, "No accumulated yield to claim");

        pool.accumulatedYieldUSDC = 0;
        emit YieldClaimed(poolId, candidateZkDid, yieldPaid);
        return yieldPaid;
    }
}
