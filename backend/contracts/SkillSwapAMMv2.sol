// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillSwapAMMv2
 * @dev SkillMatch DNA Version 26.0: Planetary Autonomous Skill AMM Pools & Universal Basic Skill Income (aUBI) Protocol.
 * Governs constant-product liquidity pools (x * y = k) for monetizable skill asset nodes,
 * automated algorithmic UBI continuous yield distribution, and cross-chain AI enterprise licensing.
 */
contract SkillSwapAMMv2 {
    struct SkillAssetNode {
        bytes32 assetId;
        string assetName;
        string moduleType; // "ARCHITECTURE_BLUEPRINT", "VERIFIED_CODE_MODULE", "ALGORITHMIC_BENCHMARK"
        bytes32 candidateZkDid;
        address candidatePayoutAddress;
        uint256 reserveSkillTokens;
        uint256 reserveUSDC;
        uint256 totalLPShares;
        uint256 accumulatedAUBIYieldUSDC;
        uint256 claimedAUBIYieldUSDC;
        uint256 royaltyBasisPoints; // e.g., 250 = 2.5%
        uint256 timesLicensed;
        bool isActive;
    }

    address public immutable protocolGovernor;
    uint256 public totalSkillAssets;
    uint256 public totalAUBIDisbursedUSDC;

    mapping(bytes32 => SkillAssetNode) public skillAssets;
    mapping(bytes32 => mapping(address => uint256)) public lpShares;
    mapping(bytes32 => uint256) public candidateAUBIBalances; // candidateZkDid => uncollected aUBI USDC

    event SkillAssetRegistered(
        bytes32 indexed assetId,
        string assetName,
        string moduleType,
        bytes32 indexed candidateZkDid,
        address payoutAddress
    );
    event LiquidityBonded(
        bytes32 indexed assetId,
        address indexed provider,
        uint256 skillAdded,
        uint256 usdcAdded,
        uint256 sharesMinted
    );
    event SkillAssetSwapped(
        bytes32 indexed assetId,
        address indexed enterpriseAgent,
        uint256 usdcPaid,
        uint256 skillTokensOut,
        uint256 aubiYieldDistributed
    );
    event AUBIYieldStreamed(
        bytes32 indexed assetId,
        bytes32 indexed candidateZkDid,
        uint256 aubiAmountUSDC
    );
    event AUBIClaimed(
        bytes32 indexed candidateZkDid,
        address indexed payoutAddress,
        uint256 amountClaimedUSDC
    );

    error AssetAlreadyExists(bytes32 assetId);
    error AssetNotFound(bytes32 assetId);
    error InvalidReserves();
    error InsufficientLiquidity();
    error SlippageExceeded();
    error ZeroClaimableYield();
    error Unauthorized();

    modifier onlyGovernor() {
        if (msg.sender != protocolGovernor) revert Unauthorized();
        _;
    }

    constructor() {
        protocolGovernor = msg.sender;
    }

    /**
     * @notice Registers a verified skill asset node and bootstraps an automated AMM pool.
     */
    function registerSkillAsset(
        bytes32 assetId,
        string calldata assetName,
        string calldata moduleType,
        bytes32 candidateZkDid,
        address candidatePayoutAddress,
        uint256 initialSkillReserve,
        uint256 initialUSDCReserve,
        uint256 royaltyBps
    ) external returns (bytes32) {
        if (skillAssets[assetId].isActive) revert AssetAlreadyExists(assetId);
        if (initialSkillReserve == 0 || initialUSDCReserve == 0) revert InvalidReserves();

        uint256 initialShares = initialSkillReserve * initialUSDCReserve;

        skillAssets[assetId] = SkillAssetNode({
            assetId: assetId,
            assetName: assetName,
            moduleType: moduleType,
            candidateZkDid: candidateZkDid,
            candidatePayoutAddress: candidatePayoutAddress,
            reserveSkillTokens: initialSkillReserve,
            reserveUSDC: initialUSDCReserve,
            totalLPShares: initialShares,
            accumulatedAUBIYieldUSDC: 0,
            claimedAUBIYieldUSDC: 0,
            royaltyBasisPoints: royaltyBps > 0 ? royaltyBps : 250,
            timesLicensed: 0,
            isActive: true
        });

        lpShares[assetId][msg.sender] = initialShares;
        totalSkillAssets += 1;

        emit SkillAssetRegistered(assetId, assetName, moduleType, candidateZkDid, candidatePayoutAddress);
        emit LiquidityBonded(assetId, msg.sender, initialSkillReserve, initialUSDCReserve, initialShares);

        return assetId;
    }

    /**
     * @notice Swaps USDC for skill module usage rights, streaming instant aUBI passive yield to creator.
     */
    function swapSkillLiquidity(
        bytes32 assetId,
        uint256 usdcIn,
        uint256 minSkillTokensOut,
        address recipient
    ) external returns (uint256 skillTokensOut, uint256 aubiYield) {
        SkillAssetNode storage asset = skillAssets[assetId];
        if (!asset.isActive) revert AssetNotFound(assetId);
        if (usdcIn == 0) revert InvalidReserves();

        // Calculate aUBI passive yield fee (e.g. 2.5%)
        aubiYield = (usdcIn * asset.royaltyBasisPoints) / 10000;
        uint256 netUsdcIn = usdcIn - aubiYield;

        // Constant-product invariant: (x + dx_net) * (y - dy) = x * y
        uint256 newReserveUSDC = asset.reserveUSDC + netUsdcIn;
        uint256 newReserveSkill = (asset.reserveUSDC * asset.reserveSkillTokens) / newReserveUSDC;
        skillTokensOut = asset.reserveSkillTokens - newReserveSkill;

        if (skillTokensOut < minSkillTokensOut) revert SlippageExceeded();
        if (skillTokensOut >= asset.reserveSkillTokens) revert InsufficientLiquidity();

        // Update reserves and metrics
        asset.reserveUSDC = newReserveUSDC;
        asset.reserveSkillTokens = newReserveSkill;
        asset.accumulatedAUBIYieldUSDC += aubiYield;
        asset.timesLicensed += 1;

        candidateAUBIBalances[asset.candidateZkDid] += aubiYield;
        totalAUBIDisbursedUSDC += aubiYield;

        emit SkillAssetSwapped(assetId, msg.sender, usdcIn, skillTokensOut, aubiYield);
        emit AUBIYieldStreamed(assetId, asset.candidateZkDid, aubiYield);

        return (skillTokensOut, aubiYield);
    }

    /**
     * @notice Claims accumulated Algorithmic Universal Basic Skill Income (aUBI) for a verified candidate.
     */
    function claimAUBIYield(bytes32 assetId, bytes32 candidateZkDid) external returns (uint256 amountClaimed) {
        SkillAssetNode storage asset = skillAssets[assetId];
        if (!asset.isActive) revert AssetNotFound(assetId);

        amountClaimed = candidateAUBIBalances[candidateZkDid];
        if (amountClaimed == 0) revert ZeroClaimableYield();

        candidateAUBIBalances[candidateZkDid] = 0;
        asset.claimedAUBIYieldUSDC += amountClaimed;

        emit AUBIClaimed(candidateZkDid, asset.candidatePayoutAddress, amountClaimed);
        return amountClaimed;
    }

    /**
     * @notice Returns complete pool telemetry and aUBI metrics for an asset.
     */
    function getAssetMetrics(bytes32 assetId) external view returns (
        uint256 reserveSkill,
        uint256 reserveUSDC,
        uint256 totalShares,
        uint256 totalAUBIYield,
        uint256 licenseCount,
        bool active
    ) {
        SkillAssetNode storage asset = skillAssets[assetId];
        return (
            asset.reserveSkillTokens,
            asset.reserveUSDC,
            asset.totalLPShares,
            asset.accumulatedAUBIYieldUSDC,
            asset.timesLicensed,
            asset.isActive
        );
    }
}
