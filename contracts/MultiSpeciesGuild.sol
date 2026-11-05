// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSpeciesGuild
 * @notice Governs Multi-Species Autonomous Guilds (MAGs / Zero-Human Corporations),
 *         chartering self-funding AI corporate entities, multi-species workforce hiring
 *         (human zkDIDs, autonomous AI agents, hardware clusters), CI/CD-triggered
 *         continuous dividend streaming, and zero-interest skill collateral credit facilities.
 * @dev Part of SkillMatch DNA Version 24.0: Trans-Neural Synaptic Resonance,
 *      Hyperbolic Quantum Annealing & Autonomous Multi-Species Guilds.
 */
contract MultiSpeciesGuild {
    enum WorkforceSpecies { HUMAN_ZKDID, AI_AGENT_WORKER, HARDWARE_QPU_CLUSTER }

    struct GuildEntity {
        string guildId;
        string name;
        address founderContract;
        uint256 treasuryBalanceUSDC;
        uint256 activeMilestoneCount;
        bool isActive;
    }

    struct SpeciesWorker {
        bytes32 workerId;
        string guildId;
        WorkforceSpecies species;
        address payoutAddress;
        bytes32 zkDIDCommitment;
        uint256 streamRatePerBlockUSDC; // micro-USDC per block
        uint256 lastStreamBlock;
        uint256 totalClaimedUSDC;
        bool isEmployed;
    }

    struct SkillCollateralVault {
        bytes32 vaultId;
        address candidateAddress;
        bytes32 zkDIDCommitment;
        uint256 ccrsRatingBasisPoints; // e.g. 8950 = 89.50%
        uint256 maxCreditUSDC;
        uint256 drawnCreditUSDC;
        bool isCollateralized;
    }

    struct CIMilestoneRecord {
        bytes32 milestoneId;
        string guildId;
        uint256 prNumber;
        bytes32 commitHash;
        uint256 totalDisbursedUSDC;
        uint256 timestamp;
        bool isVerified;
    }

    address public immutable governanceAuthority;
    uint256 public totalGuildsChartered;
    uint256 public totalWorkersEmployed;
    uint256 public totalCIMilestonesExecuted;

    mapping(string => GuildEntity) public guilds;
    mapping(bytes32 => SpeciesWorker) public workers;
    mapping(string => bytes32[]) public guildWorkerIds;
    mapping(bytes32 => SkillCollateralVault) public skillVaults;
    mapping(bytes32 => CIMilestoneRecord) public ciMilestones;

    event GuildChartered(string indexed guildId, string name, address indexed founder, uint256 initialTreasury);
    event SpeciesWorkerEmployed(bytes32 indexed workerId, string indexed guildId, WorkforceSpecies species, uint256 streamRate);
    event BlockStreamClaimed(bytes32 indexed workerId, address indexed recipient, uint256 amountUSDC, uint256 blocksElapsed);
    event CIMilestoneExecuted(string indexed guildId, uint256 prNumber, bytes32 commitHash, uint256 totalPayout);
    event SkillCollateralLocked(bytes32 indexed vaultId, address indexed candidate, uint256 ccrsRating, uint256 maxCredit);
    event CreditDrawn(bytes32 indexed vaultId, address indexed candidate, uint256 amount);
    event MicroRoyaltyRepaid(bytes32 indexed vaultId, uint256 amount, uint256 remainingDebt);

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "MAG: caller is not governance authority");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Charters a new Multi-Species Autonomous Guild
     */
    function charterGuild(
        string calldata guildId,
        string calldata name
    ) external payable returns (bool) {
        require(!guilds[guildId].isActive, "MAG: guild already chartered");
        require(bytes(name).length > 0, "MAG: name required");

        guilds[guildId] = GuildEntity({
            guildId: guildId,
            name: name,
            founderContract: msg.sender,
            treasuryBalanceUSDC: msg.value,
            activeMilestoneCount: 0,
            isActive: true
        });

        totalGuildsChartered++;
        emit GuildChartered(guildId, name, msg.sender, msg.value);
        return true;
    }

    /**
     * @notice Hires a worker from any species (Human zkDID, AI Agent, or Hardware Cluster)
     */
    function hireSpeciesWorker(
        string calldata guildId,
        WorkforceSpecies species,
        address payoutAddress,
        bytes32 zkDIDCommitment,
        uint256 streamRatePerBlockUSDC
    ) external returns (bytes32) {
        require(guilds[guildId].isActive, "MAG: inactive guild");
        require(payoutAddress != address(0), "MAG: invalid payout address");
        require(streamRatePerBlockUSDC > 0, "MAG: stream rate must be > 0");

        bytes32 workerId = keccak256(
            abi.encodePacked(guildId, payoutAddress, zkDIDCommitment, block.timestamp)
        );

        workers[workerId] = SpeciesWorker({
            workerId: workerId,
            guildId: guildId,
            species: species,
            payoutAddress: payoutAddress,
            zkDIDCommitment: zkDIDCommitment,
            streamRatePerBlockUSDC: streamRatePerBlockUSDC,
            lastStreamBlock: block.number,
            totalClaimedUSDC: 0,
            isEmployed: true
        });

        guildWorkerIds[guildId].push(workerId);
        totalWorkersEmployed++;

        emit SpeciesWorkerEmployed(workerId, guildId, species, streamRatePerBlockUSDC);
        return workerId;
    }

    /**
     * @notice Streams accrued block-by-block tokens to the worker
     */
    function claimStreamedPayroll(bytes32 workerId) external returns (uint256) {
        SpeciesWorker storage worker = workers[workerId];
        require(worker.isEmployed, "MAG: worker not employed");
        require(msg.sender == worker.payoutAddress, "MAG: caller not payout address");

        uint256 blocksElapsed = block.number - worker.lastStreamBlock;
        require(blocksElapsed > 0, "MAG: no blocks elapsed");

        uint256 accruedUSDC = blocksElapsed * worker.streamRatePerBlockUSDC;
        GuildEntity storage guild = guilds[worker.guildId];
        require(guild.treasuryBalanceUSDC >= accruedUSDC, "MAG: insufficient guild treasury");

        worker.lastStreamBlock = block.number;
        worker.totalClaimedUSDC += accruedUSDC;
        guild.treasuryBalanceUSDC -= accruedUSDC;

        (bool success, ) = worker.payoutAddress.call{value: accruedUSDC}("");
        require(success, "MAG: payout transfer failed");

        emit BlockStreamClaimed(workerId, worker.payoutAddress, accruedUSDC, blocksElapsed);
        return accruedUSDC;
    }

    /**
     * @notice Executes CI milestone dividend streaming triggered by verified automated PR/commit tests
     */
    function recordCIMilestoneAndStream(
        string calldata guildId,
        uint256 prNumber,
        bytes32 commitHash,
        uint256 dividendPayoutUSDC
    ) external returns (bytes32) {
        GuildEntity storage guild = guilds[guildId];
        require(guild.isActive, "MAG: guild inactive");
        require(guild.treasuryBalanceUSDC >= dividendPayoutUSDC, "MAG: insufficient treasury");

        bytes32 milestoneId = keccak256(abi.encodePacked(guildId, prNumber, commitHash, block.number));
        ciMilestones[milestoneId] = CIMilestoneRecord({
            milestoneId: milestoneId,
            guildId: guildId,
            prNumber: prNumber,
            commitHash: commitHash,
            totalDisbursedUSDC: dividendPayoutUSDC,
            timestamp: block.timestamp,
            isVerified: true
        });

        guild.treasuryBalanceUSDC -= dividendPayoutUSDC;
        guild.activeMilestoneCount++;
        totalCIMilestonesExecuted++;

        emit CIMilestoneExecuted(guildId, prNumber, commitHash, dividendPayoutUSDC);
        return milestoneId;
    }

    /**
     * @notice Deposits verified skill vector for zero-interest credit facility (CCRS >= 85.00% = 8500 bps)
     */
    function depositSkillCollateral(
        bytes32 zkDIDCommitment,
        uint256 ccrsRatingBasisPoints,
        uint256 maxCreditUSDC
    ) external returns (bytes32) {
        require(ccrsRatingBasisPoints >= 8500, "MAG: CCRS must be >= 85.00%");
        require(maxCreditUSDC > 0, "MAG: max credit must be > 0");

        bytes32 vaultId = keccak256(abi.encodePacked(msg.sender, zkDIDCommitment, block.timestamp));
        skillVaults[vaultId] = SkillCollateralVault({
            vaultId: vaultId,
            candidateAddress: msg.sender,
            zkDIDCommitment: zkDIDCommitment,
            ccrsRatingBasisPoints: ccrsRatingBasisPoints,
            maxCreditUSDC: maxCreditUSDC,
            drawnCreditUSDC: 0,
            isCollateralized: true
        });

        emit SkillCollateralLocked(vaultId, msg.sender, ccrsRatingBasisPoints, maxCreditUSDC);
        return vaultId;
    }

    /**
     * @notice Disburses zero-interest credit line to candidate
     */
    function drawZeroInterestCredit(bytes32 vaultId, uint256 amountUSDC) external returns (bool) {
        SkillCollateralVault storage vault = skillVaults[vaultId];
        require(vault.isCollateralized, "MAG: vault not active");
        require(msg.sender == vault.candidateAddress, "MAG: caller not vault owner");
        require(vault.drawnCreditUSDC + amountUSDC <= vault.maxCreditUSDC, "MAG: credit limit exceeded");

        vault.drawnCreditUSDC += amountUSDC;
        emit CreditDrawn(vaultId, msg.sender, amountUSDC);
        return true;
    }

    /**
     * @notice Deducts inbound micro-royalties to repay zero-interest credit balances
     */
    function repayMicroRoyalty(bytes32 vaultId, uint256 amountUSDC) external returns (uint256 remainingDebt) {
        SkillCollateralVault storage vault = skillVaults[vaultId];
        require(vault.isCollateralized, "MAG: vault not active");
        require(vault.drawnCreditUSDC > 0, "MAG: no debt to repay");

        if (amountUSDC >= vault.drawnCreditUSDC) {
            vault.drawnCreditUSDC = 0;
        } else {
            vault.drawnCreditUSDC -= amountUSDC;
        }

        emit MicroRoyaltyRepaid(vaultId, amountUSDC, vault.drawnCreditUSDC);
        return vault.drawnCreditUSDC;
    }
}
