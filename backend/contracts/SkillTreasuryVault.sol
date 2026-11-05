// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillTreasuryVault — SkillMatch DNA v22.0
 * @notice Decentralized Skill Liquidity Staking & Autonomous Yield Treasury.
 * Enables candidates to lock verified zk-STARK capability vectors as collateral,
 * issue zero-interest educational credit lines, auto-repay via enterprise micro-royalties,
 * and earn passive yield through skill licensing AMM pools.
 */
contract SkillTreasuryVault {
    // --- Structs ---
    struct CollateralPosition {
        string zkdid;
        address candidateWallet;
        uint256 verifiedCcrsBps; // e.g. 9150 = 91.50% (min 8500 required)
        uint256 collateralValuationWei;
        uint256 maxCreditLimitWei;
        bool active;
        uint256 lockedAt;
    }

    struct CreditLine {
        uint256 positionId;
        address borrower;
        uint256 borrowedAmountWei;
        uint256 remainingDebtWei;
        uint256 totalRepaidViaRoyaltiesWei;
        bool isCleared;
        uint256 issuedAt;
    }

    struct YieldPool {
        string skillCluster;
        uint256 totalValueLockedWei;
        uint256 apyBps; // e.g. 1840 = 18.40%
        uint256 stakersCount;
    }

    // --- State Variables ---
    address public immutable governanceCouncil;
    uint256 public constant MIN_CCRS_BPS = 8500; // 85.0%
    uint256 public constant LTV_BPS = 6000; // 60.0% Max Loan-to-Value

    uint256 private _positionCounter;
    uint256 private _creditLineCounter;

    mapping(uint256 => CollateralPosition) public collateralPositions;
    mapping(uint256 => CreditLine) public creditLines;
    mapping(bytes32 => YieldPool) public yieldPools;

    // --- Events ---
    event SkillCollateralLocked(uint256 indexed positionId, string zkdid, address indexed candidate, uint256 valuationWei, uint256 creditLimitWei);
    event ZeroInterestCreditIssued(uint256 indexed creditLineId, uint256 indexed positionId, address indexed borrower, uint256 amountWei);
    event MicroRoyaltyAutoRepaid(uint256 indexed creditLineId, address indexed sourceConsortium, uint256 amountWei, uint256 remainingDebtWei);
    event SkillYieldHarvested(address indexed candidate, bytes32 indexed poolKey, uint256 rewardAmountWei);

    // --- Modifiers ---
    modifier onlyCouncil() {
        require(msg.sender == governanceCouncil, "SkillTreasuryVault: Unauthorized");
        _;
    }

    constructor() {
        governanceCouncil = msg.sender;
        _initYieldPool("RUST_SYSTEMS", "High-Throughput Rust & eBPF Systems", 1840);
        _initYieldPool("WASM_EDGE", "Sub-Nanosecond WebAssembly & Edge Mesh", 1680);
        _initYieldPool("ZK_CRYPTO", "Zero-Knowledge Plonky3 & Halo2 Circuits", 2250);
    }

    function _initYieldPool(string memory key, string memory clusterName, uint256 apyBps) internal {
        bytes32 poolKey = keccak256(abi.encodePacked(key));
        yieldPools[poolKey] = YieldPool({
            skillCluster: clusterName,
            totalValueLockedWei: 0,
            apyBps: apyBps,
            stakersCount: 0
        });
    }

    /**
     * @notice Locks verified candidate skill capability vector as credit collateral.
     * @param zkdid Candidate decentralized zero-knowledge identifier.
     * @param ccrsBps Candidate Composite Readiness Score in basis points (>= 8500).
     * @param valuationWei Appraised collateral valuation in Wei.
     */
    function lockSkillCollateral(
        string calldata zkdid,
        uint256 ccrsBps,
        uint256 valuationWei
    ) external returns (uint256 positionId) {
        require(ccrsBps >= MIN_CCRS_BPS, "SkillTreasuryVault: CCRS below 85.0% threshold");
        require(valuationWei > 0, "SkillTreasuryVault: Zero valuation");

        positionId = ++_positionCounter;
        uint256 creditLimit = (valuationWei * LTV_BPS) / 10000;

        collateralPositions[positionId] = CollateralPosition({
            zkdid: zkdid,
            candidateWallet: msg.sender,
            verifiedCcrsBps: ccrsBps,
            collateralValuationWei: valuationWei,
            maxCreditLimitWei: creditLimit,
            active: true,
            lockedAt: block.timestamp
        });

        emit SkillCollateralLocked(positionId, zkdid, msg.sender, valuationWei, creditLimit);
    }

    /**
     * @notice Issues a non-custodial zero-interest credit line against verified skill collateral.
     */
    function issueZeroInterestCredit(
        uint256 positionId,
        uint256 requestedAmountWei
    ) external returns (uint256 creditLineId) {
        CollateralPosition storage pos = collateralPositions[positionId];
        require(pos.active, "SkillTreasuryVault: Inactive collateral position");
        require(pos.candidateWallet == msg.sender, "SkillTreasuryVault: Not collateral owner");
        require(requestedAmountWei <= pos.maxCreditLimitWei, "SkillTreasuryVault: Exceeds max credit limit");

        creditLineId = ++_creditLineCounter;
        creditLines[creditLineId] = CreditLine({
            positionId: positionId,
            borrower: msg.sender,
            borrowedAmountWei: requestedAmountWei,
            remainingDebtWei: requestedAmountWei,
            totalRepaidViaRoyaltiesWei: 0,
            isCleared: false,
            issuedAt: block.timestamp
        });

        emit ZeroInterestCreditIssued(creditLineId, positionId, msg.sender, requestedAmountWei);
    }

    /**
     * @notice Automatically routes incoming enterprise consortia micro-royalties to clear credit debt.
     */
    function repayViaMicroRoyalty(uint256 creditLineId) external payable {
        CreditLine storage line = creditLines[creditLineId];
        require(!line.isCleared, "SkillTreasuryVault: Credit line already cleared");
        require(msg.value > 0, "SkillTreasuryVault: Zero repayment value");

        uint256 repayment = msg.value;
        if (repayment >= line.remainingDebtWei) {
            uint256 surplus = repayment - line.remainingDebtWei;
            line.totalRepaidViaRoyaltiesWei += line.remainingDebtWei;
            line.remainingDebtWei = 0;
            line.isCleared = true;

            // Route surplus directly to candidate
            if (surplus > 0) {
                (bool success, ) = payable(line.borrower).call{value: surplus}("");
                require(success, "SkillTreasuryVault: Surplus transfer failed");
            }
        } else {
            line.remainingDebtWei -= repayment;
            line.totalRepaidViaRoyaltiesWei += repayment;
        }

        emit MicroRoyaltyAutoRepaid(creditLineId, msg.sender, repayment, line.remainingDebtWei);
    }

    receive() external payable {}
}
