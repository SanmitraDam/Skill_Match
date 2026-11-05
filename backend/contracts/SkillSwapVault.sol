// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillSwapVault
 * @notice SkillSwap v2.0 Protocol: Automated Skill Liquidity AMM Pools & Yield Vaults.
 *         Tokenizes verified skill vectors (D_k >= 4.5) into liquid assets and distributes
 *         continuous micro-royalty APY to candidate zkDID holders when modules are staked or utilized.
 * @dev Part of SkillMatch DNA Version 13.0: Omni-Dimensional Super-Intelligence.
 */
contract SkillSwapVault {
    struct SkillLiquidityPool {
        bytes32 skillPoolId;
        string skillName;
        uint256 reserveSkillToken;
        uint256 reserveUSDC;
        uint256 totalLPTokens;
        uint256 accumulatedRoyaltiesUSDC;
        uint256 minSkillProficiencyDk; // scaled by 10 (e.g. 45 = 4.5 D_k)
        bool isActive;
    }

    struct CandidateSkillStake {
        bytes32 stakeId;
        address candidate;
        bytes32 skillPoolId;
        bytes32 zkDIDCommitment;
        uint256 stakedSkillTokens;
        uint256 accruedRoyaltyYieldUSDC;
        uint256 lastClaimTimestamp;
    }

    address public immutable vaultController;
    uint256 public totalPoolsCreated;
    uint256 public totalYieldDistributedUSDC;

    mapping(bytes32 => SkillLiquidityPool) public pools;
    mapping(bytes32 => CandidateSkillStake) public stakes;
    mapping(address => uint256) public lpTokenBalances;

    event SkillPoolCreated(bytes32 indexed skillPoolId, string skillName, uint256 minDk, uint256 initialUSDC);
    event SkillTokensSwapped(bytes32 indexed skillPoolId, address indexed swapper, uint256 inUSDC, uint256 outSkillTokens);
    event SkillRoyaltyAccrued(bytes32 indexed skillPoolId, uint256 amountUSDC, string callerGuild);
    event RoyaltyYieldClaimed(bytes32 indexed stakeId, address indexed candidate, uint256 amountUSDC);

    modifier onlyController() {
        require(msg.sender == vaultController, "SkillSwap: caller is not controller");
        _;
    }

    constructor() {
        vaultController = msg.sender;
    }

    /**
     * @notice Creates a new SkillSwap v2.0 liquidity pool for a verified skill capability
     */
    function createSkillPool(
        string calldata skillName,
        uint256 minSkillProficiencyDk
    ) external payable returns (bytes32) {
        require(minSkillProficiencyDk >= 45, "SkillSwap: minimum D_k must be >= 4.5");
        require(msg.value > 0, "SkillSwap: initial USDC liquidity required");

        bytes32 poolId = keccak256(abi.encodePacked(skillName, minSkillProficiencyDk, block.timestamp));
        uint256 initialSkillTokens = 100000 * 1 ether;

        pools[poolId] = SkillLiquidityPool({
            skillPoolId: poolId,
            skillName: skillName,
            reserveSkillToken: initialSkillTokens,
            reserveUSDC: msg.value,
            totalLPTokens: msg.value,
            accumulatedRoyaltiesUSDC: 0,
            minSkillProficiencyDk: minSkillProficiencyDk,
            isActive: true
        });

        lpTokenBalances[msg.sender] += msg.value;
        totalPoolsCreated++;

        emit SkillPoolCreated(poolId, skillName, minSkillProficiencyDk, msg.value);
        return poolId;
    }

    /**
     * @notice Stakes candidate verified skill tokens into the pool to earn passive micro-royalty APY
     */
    function stakeVerifiedSkill(
        bytes32 poolId,
        bytes32 zkDIDCommitment,
        uint256 tokenAmount
    ) external returns (bytes32) {
        require(pools[poolId].isActive, "SkillSwap: inactive pool");
        require(tokenAmount > 0, "SkillSwap: zero token stake");

        bytes32 stakeId = keccak256(abi.encodePacked(msg.sender, poolId, zkDIDCommitment, block.timestamp));

        stakes[stakeId] = CandidateSkillStake({
            stakeId: stakeId,
            candidate: msg.sender,
            skillPoolId: poolId,
            zkDIDCommitment: zkDIDCommitment,
            stakedSkillTokens: tokenAmount,
            accruedRoyaltyYieldUSDC: 0,
            lastClaimTimestamp: block.timestamp
        });

        return stakeId;
    }

    /**
     * @notice Deposits micro-royalties into the pool from enterprise guild code consumption
     */
    function depositModuleUtilizationRoyalty(bytes32 poolId, string calldata callerGuild) external payable returns (bool) {
        require(pools[poolId].isActive, "SkillSwap: inactive pool");
        require(msg.value > 0, "SkillSwap: royalty amount must be > 0");

        pools[poolId].accumulatedRoyaltiesUSDC += msg.value;
        pools[poolId].reserveUSDC += msg.value;

        emit SkillRoyaltyAccrued(poolId, msg.value, callerGuild);
        return true;
    }

    /**
     * @notice Claims accrued micro-royalty yield for a candidate stake
     */
    function claimYield(bytes32 stakeId) external returns (uint256) {
        CandidateSkillStake storage stake = stakes[stakeId];
        require(stake.candidate == msg.sender, "SkillSwap: unauthorized caller");

        SkillLiquidityPool storage pool = pools[stake.skillPoolId];
        // Calculate accrued yield proportional to stake
        uint256 claimable = (pool.accumulatedRoyaltiesUSDC * stake.stakedSkillTokens) / (pool.reserveSkillToken + 1 ether);
        require(claimable > 0, "SkillSwap: no claimable yield available");

        stake.accruedRoyaltyYieldUSDC += claimable;
        stake.lastClaimTimestamp = block.timestamp;
        totalYieldDistributedUSDC += claimable;

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "SkillSwap: yield transfer failed");

        emit RoyaltyYieldClaimed(stakeId, msg.sender, claimable);
        return claimable;
    }
}
