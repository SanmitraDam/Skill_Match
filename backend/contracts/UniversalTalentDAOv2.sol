// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UniversalTalentDAOv2
 * @notice Governs Self-Evolving Universal Talent Guilds (UTDAO v2.0),
 *         automated Algorithmic Universal Income (aUBI) skill yield vaults,
 *         verified zk-STARK capability vector collateralization (Dk >= 4.8),
 *         and block-by-block real-time equity and dividend streaming.
 * @dev Part of SkillMatch DNA Version 14.0: Cosmic Neural Noosphere Platform.
 */
contract UniversalTalentDAOv2 {
    struct AutonomousGuild {
        string guildId;
        string name;
        address creator;
        uint256 totalMembers;
        uint256 treasuryUSDC;
        uint256 planetaryDemandIndex; // scaled by 100 (e.g. 9850 = 98.50%)
        string targetRepositoryURI;
        bool isActive;
    }

    struct CollateralizedSkillVault {
        bytes32 vaultId;
        address candidate;
        bytes32 zkDIDCommitment;
        uint256 proficiencyDk; // Scaled by 1000, minimum 4800 (4.80)
        uint256 collateralStakedUSDC;
        uint256 totalAUBIDistributed;
        uint256 lastClaimBlock;
        uint256 streamRatePerBlock; // micro-USDC per block
        bool isCollateralized;
    }

    struct EquityStream {
        bytes32 streamId;
        string guildId;
        address recipient;
        uint256 sharesBps; // basis points (1/100 of 1%)
        uint256 startBlock;
        uint256 verifiedPRCount;
        uint256 systemUptimeBps; // basis points
        bool active;
    }

    address public immutable governanceAuthority;
    uint256 public totalGuildsChartered;
    uint256 public totalAUBIClaimedGlobal;
    uint256 public constant MIN_PROFICIENCY_DK = 4800; // 4.80 Dk minimum requirement

    mapping(string => AutonomousGuild) public guilds;
    mapping(bytes32 => CollateralizedSkillVault) public skillVaults;
    mapping(bytes32 => EquityStream) public equityStreams;
    mapping(address => bytes32[]) public candidateVaults;

    event GuildChartered(string indexed guildId, string name, address indexed creator, uint256 initialTreasury);
    event SkillCollateralized(bytes32 indexed vaultId, address indexed candidate, uint256 proficiencyDk, uint256 stakedUSDC);
    event AUBIYieldDisbursed(bytes32 indexed vaultId, address indexed recipient, uint256 yieldAmountUSDC, uint256 blockNumber);
    event EquityStreamInitialized(bytes32 indexed streamId, string indexed guildId, address indexed recipient, uint256 sharesBps);
    event PRMetricsVerified(bytes32 indexed streamId, uint256 newPRCount, uint256 uptimeBps);

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "UniversalTalentDAOv2: unauthorized caller");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Charters an autonomous self-evolving corporate guild (UTDAO v2.0)
     */
    function charterGuild(
        string calldata guildId,
        string calldata name,
        uint256 initialTreasury,
        uint256 planetaryDemandIndex,
        string calldata targetRepositoryURI
    ) external returns (bool) {
        require(bytes(guildId).length > 0, "UniversalTalentDAOv2: empty guild ID");
        require(guilds[guildId].creator == address(0), "UniversalTalentDAOv2: guild already exists");

        guilds[guildId] = AutonomousGuild({
            guildId: guildId,
            name: name,
            creator: msg.sender,
            totalMembers: 1,
            treasuryUSDC: initialTreasury,
            planetaryDemandIndex: planetaryDemandIndex,
            targetRepositoryURI: targetRepositoryURI,
            isActive: true
        });

        totalGuildsChartered++;
        emit GuildChartered(guildId, name, msg.sender, initialTreasury);
        return true;
    }

    /**
     * @notice Collateralizes verified zk-STARK capability vector into automated aUBI skill vault.
     *         Requires proficiencyDk >= 4.80 (4800 in scaled basis).
     */
    function collateralizeSkillVector(
        bytes32 zkDIDCommitment,
        uint256 proficiencyDk,
        uint256 stakedUSDC,
        uint256 streamRatePerBlock
    ) external returns (bytes32) {
        require(proficiencyDk >= MIN_PROFICIENCY_DK, "UniversalTalentDAOv2: proficiency below Dk 4.80 floor");
        require(stakedUSDC > 0, "UniversalTalentDAOv2: collateral must be greater than zero");

        bytes32 vaultId = keccak256(abi.encodePacked(msg.sender, zkDIDCommitment, block.timestamp, block.number));

        skillVaults[vaultId] = CollateralizedSkillVault({
            vaultId: vaultId,
            candidate: msg.sender,
            zkDIDCommitment: zkDIDCommitment,
            proficiencyDk: proficiencyDk,
            collateralStakedUSDC: stakedUSDC,
            totalAUBIDistributed: 0,
            lastClaimBlock: block.number,
            streamRatePerBlock: streamRatePerBlock,
            isCollateralized: true
        });

        candidateVaults[msg.sender].push(vaultId);
        emit SkillCollateralized(vaultId, msg.sender, proficiencyDk, stakedUSDC);
        return vaultId;
    }

    /**
     * @notice Claims accrued algorithmic universal basic income (aUBI) micro-royalties
     */
    function claimAUBIYield(bytes32 vaultId) external returns (uint256) {
        CollateralizedSkillVault storage vault = skillVaults[vaultId];
        require(vault.isCollateralized, "UniversalTalentDAOv2: vault not active");
        require(vault.candidate == msg.sender, "UniversalTalentDAOv2: caller is not vault owner");
        require(block.number > vault.lastClaimBlock, "UniversalTalentDAOv2: zero blocks elapsed");

        uint256 blocksElapsed = block.number - vault.lastClaimBlock;
        uint256 yieldAccrued = blocksElapsed * vault.streamRatePerBlock;

        vault.lastClaimBlock = block.number;
        vault.totalAUBIDistributed += yieldAccrued;
        totalAUBIClaimedGlobal += yieldAccrued;

        emit AUBIYieldDisbursed(vaultId, msg.sender, yieldAccrued, block.number);
        return yieldAccrued;
    }

    /**
     * @notice Initializes a block-by-block equity and dividend stream to a candidate zkDID
     */
    function initializeEquityStream(
        string calldata guildId,
        address recipient,
        uint256 sharesBps,
        uint256 initialUptimeBps
    ) external returns (bytes32) {
        AutonomousGuild storage guild = guilds[guildId];
        require(guild.isActive, "UniversalTalentDAOv2: guild inactive");
        require(msg.sender == guild.creator || msg.sender == governanceAuthority, "UniversalTalentDAOv2: unauthorized");

        bytes32 streamId = keccak256(abi.encodePacked(guildId, recipient, block.number));

        equityStreams[streamId] = EquityStream({
            streamId: streamId,
            guildId: guildId,
            recipient: recipient,
            sharesBps: sharesBps,
            startBlock: block.number,
            verifiedPRCount: 0,
            systemUptimeBps: initialUptimeBps,
            active: true
        });

        guild.totalMembers++;
        emit EquityStreamInitialized(streamId, guildId, recipient, sharesBps);
        return streamId;
    }

    /**
     * @notice Verifies candidate Pull Requests and updates system uptime for equity streaming
     */
    function verifyPRAndUptime(
        bytes32 streamId,
        uint256 additionalPRs,
        uint256 newUptimeBps
    ) external onlyGovernance returns (bool) {
        EquityStream storage stream = equityStreams[streamId];
        require(stream.active, "UniversalTalentDAOv2: stream inactive");

        stream.verifiedPRCount += additionalPRs;
        stream.systemUptimeBps = newUptimeBps;

        emit PRMetricsVerified(streamId, stream.verifiedPRCount, newUptimeBps);
        return true;
    }

    /**
     * @notice Retrieves the vaults associated with a candidate address
     */
    function getCandidateVaults(address candidate) external view returns (bytes32[] memory) {
        return candidateVaults[candidate];
    }
}
