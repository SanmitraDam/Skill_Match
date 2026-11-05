// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UniversalTalentDAO
 * @notice Governs Self-Sovereign Worker-Owned Talent Federations (UTDAOs),
 *         planetary skill liquidity pools, open-source R&D grant allocations,
 *         and synthetic skill derivatives backed by verified earning potential (CCRS >= 90%).
 * @dev Part of SkillMatch DNA Version 12.0: Universal Human-AI Super-Intelligence Matrix.
 */
contract UniversalTalentDAO {
    struct TalentDAO {
        string daoId;
        string name;
        address founder;
        uint256 memberCount;
        uint256 treasuryBalanceUSDC;
        uint256 planetarySkillIndex; // 0 - 10000 (scaled by 100)
        bool isActive;
    }

    struct RDGrantProposal {
        uint256 proposalId;
        string daoId;
        string title;
        string researchObjective;
        uint256 grantAmountUSDC;
        address recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }

    struct SyntheticSkillAsset {
        bytes32 assetId;
        address candidate;
        bytes32 zkDIDCommitment;
        uint256 ccrsScore; // min 9000 (90.00%)
        uint256 syntheticCollateralValue; // in USDC units
        uint256 mintedLiquidity; // drawn liquidity
        uint256 expirationTimestamp;
        bool isLiquidated;
    }

    address public immutable governanceAuthority;
    uint256 public proposalCounter;

    mapping(string => TalentDAO) public daos;
    mapping(uint256 => RDGrantProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(bytes32 => SyntheticSkillAsset) public syntheticAssets;
    mapping(address => uint256) public memberReputationShares;

    event DAOCreated(string indexed daoId, string name, address indexed founder, uint256 initialTreasury);
    event RDProposalCreated(uint256 indexed proposalId, string indexed daoId, uint256 grantAmountUSDC);
    event RDProposalVoted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event RDGrantExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amountUSDC);
    event SyntheticSkillMinted(bytes32 indexed assetId, address indexed candidate, uint256 ccrsScore, uint256 liquidity);
    event SyntheticSkillRepaid(bytes32 indexed assetId, address indexed candidate, uint256 amountRepaid);

    modifier onlyGovernance() {
        require(msg.sender == governanceAuthority, "UTDAO: caller is not governance authority");
        _;
    }

    constructor() {
        governanceAuthority = msg.sender;
    }

    /**
     * @notice Creates a new Universal Talent DAO
     */
    function createTalentDAO(
        string calldata daoId,
        string calldata name,
        uint256 initialSkillIndex
    ) external payable returns (bool) {
        require(!daos[daoId].isActive, "UTDAO: DAO already exists");
        require(bytes(name).length > 0, "UTDAO: name required");

        daos[daoId] = TalentDAO({
            daoId: daoId,
            name: name,
            founder: msg.sender,
            memberCount: 1,
            treasuryBalanceUSDC: msg.value,
            planetarySkillIndex: initialSkillIndex,
            isActive: true
        });

        memberReputationShares[msg.sender] += 1000;

        emit DAOCreated(daoId, name, msg.sender, msg.value);
        return true;
    }

    /**
     * @notice Submits an open-source R&D grant proposal
     */
    function submitRDGrantProposal(
        string calldata daoId,
        string calldata title,
        string calldata objective,
        uint256 grantAmountUSDC,
        address recipient,
        uint256 votingPeriodSeconds
    ) external returns (uint256) {
        require(daos[daoId].isActive, "UTDAO: inactive DAO");
        require(grantAmountUSDC <= daos[daoId].treasuryBalanceUSDC, "UTDAO: insufficient treasury");

        proposalCounter++;
        uint256 pid = proposalCounter;

        proposals[pid] = RDGrantProposal({
            proposalId: pid,
            daoId: daoId,
            title: title,
            researchObjective: objective,
            grantAmountUSDC: grantAmountUSDC,
            recipient: recipient,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingPeriodSeconds,
            executed: false
        });

        emit RDProposalCreated(pid, daoId, grantAmountUSDC);
        return pid;
    }

    /**
     * @notice Casts a reputation-weighted vote on an R&D grant
     */
    function voteOnGrant(uint256 proposalId, bool support) external returns (bool) {
        RDGrantProposal storage prop = proposals[proposalId];
        require(block.timestamp <= prop.deadline, "UTDAO: voting deadline expired");
        require(!prop.executed, "UTDAO: proposal already executed");
        require(!hasVoted[proposalId][msg.sender], "UTDAO: already voted");

        uint256 voterWeight = memberReputationShares[msg.sender];
        if (voterWeight == 0) {
            voterWeight = 100; // minimum baseline voting weight for verified members
        }

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            prop.votesFor += voterWeight;
        } else {
            prop.votesAgainst += voterWeight;
        }

        emit RDProposalVoted(proposalId, msg.sender, support, voterWeight);
        return true;
    }

    /**
     * @notice Executes an approved R&D grant
     */
    function executeRDGrant(uint256 proposalId) external returns (bool) {
        RDGrantProposal storage prop = proposals[proposalId];
        require(block.timestamp > prop.deadline, "UTDAO: voting still active");
        require(!prop.executed, "UTDAO: already executed");
        require(prop.votesFor > prop.votesAgainst, "UTDAO: proposal defeated");

        TalentDAO storage dao = daos[prop.daoId];
        require(dao.treasuryBalanceUSDC >= prop.grantAmountUSDC, "UTDAO: insufficient funds");

        prop.executed = true;
        dao.treasuryBalanceUSDC -= prop.grantAmountUSDC;

        (bool success, ) = prop.recipient.call{value: prop.grantAmountUSDC}("");
        require(success, "UTDAO: grant transfer failed");

        emit RDGrantExecuted(proposalId, prop.recipient, prop.grantAmountUSDC);
        return true;
    }

    /**
     * @notice Mints synthetic skill-backed assets for candidates with CCRS >= 90.00%
     * @param ccrsScore Scaled by 100 (e.g. 9200 = 92.00%)
     */
    function mintSyntheticSkillAsset(
        bytes32 zkDIDCommitment,
        uint256 ccrsScore,
        uint256 requestedLiquidityUSDC,
        uint256 durationDays
    ) external returns (bytes32) {
        require(ccrsScore >= 9000, "UTDAO: CCRS must be >= 90.00% for synthetic asset minting");
        require(requestedLiquidityUSDC > 0, "UTDAO: liquidity requested must be > 0");

        // Maximum synthetic asset collateral multiplier based on CCRS
        uint256 maxCollateralMultiplier = (ccrsScore * 10); // e.g. 92000
        uint256 maxBorrow = (maxCollateralMultiplier * 1 ether) / 1000;

        require(requestedLiquidityUSDC <= maxBorrow, "UTDAO: requested liquidity exceeds CCRS collateral cap");

        bytes32 assetId = keccak256(
            abi.encodePacked(msg.sender, zkDIDCommitment, ccrsScore, block.timestamp)
        );

        syntheticAssets[assetId] = SyntheticSkillAsset({
            assetId: assetId,
            candidate: msg.sender,
            zkDIDCommitment: zkDIDCommitment,
            ccrsScore: ccrsScore,
            syntheticCollateralValue: maxBorrow,
            mintedLiquidity: requestedLiquidityUSDC,
            expirationTimestamp: block.timestamp + (durationDays * 1 days),
            isLiquidated: false
        });

        emit SyntheticSkillMinted(assetId, msg.sender, ccrsScore, requestedLiquidityUSDC);
        return assetId;
    }

    /**
     * @notice Repays synthetic skill derivative liquidity
     */
    function repaySyntheticSkill(bytes32 assetId) external payable returns (bool) {
        SyntheticSkillAsset storage asset = syntheticAssets[assetId];
        require(asset.candidate == msg.sender, "UTDAO: unauthorized candidate");
        require(!asset.isLiquidated, "UTDAO: asset is liquidated");
        require(msg.value <= asset.mintedLiquidity, "UTDAO: repayment exceeds balance");

        asset.mintedLiquidity -= msg.value;

        emit SyntheticSkillRepaid(assetId, msg.sender, msg.value);
        return true;
    }
}
