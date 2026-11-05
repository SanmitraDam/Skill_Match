// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillYieldVault
 * @notice Algorithmic Universal Skill Yield (aUBI) Treasury.
 *         Aggregates micro-royalties from AI agent compute networks querying
 *         candidate-contributed code engrams and streams continuous yield to verified zkDIDs.
 * @dev Part of SkillMatch DNA Version 12.0: Universal Human-AI Super-Intelligence Matrix.
 */
contract SkillYieldVault {
    struct CandidateYieldProfile {
        bytes32 zkDIDCommitment;
        uint256 engramContributionScore; // 1 - 10000
        uint256 totalAccruedYieldWei;
        uint256 totalClaimedYieldWei;
        uint256 lastClaimTimestamp;
        bool isRegistered;
    }

    address public immutable vaultController;
    uint256 public globalComputePoolBalanceWei;
    uint256 public totalAUBIDistributedWei;
    uint256 public activeBeneficiaryCount;

    mapping(address => CandidateYieldProfile) public candidateYields;
    mapping(bytes32 => address) public didToCandidate;

    event EngramComputeRoyaltyDeposited(address indexed aiComputeAgent, uint256 amountWei, string modelRunId);
    event CandidateRegisteredForAUBI(address indexed candidate, bytes32 indexed zkDIDCommitment, uint256 engramScore);
    event AUBIYieldClaimed(address indexed candidate, bytes32 indexed zkDIDCommitment, uint256 amountWei);
    event YieldProfileUpdated(address indexed candidate, uint256 newScore);

    modifier onlyController() {
        require(msg.sender == vaultController, "SkillYieldVault: caller is not vault controller");
        _;
    }

    constructor() {
        vaultController = msg.sender;
    }

    /**
     * @notice Receives micro-royalties from global AI agent compute queries
     */
    function depositComputeRoyalty(string calldata modelRunId) external payable returns (bool) {
        require(msg.value > 0, "SkillYieldVault: deposit amount must be > 0");
        globalComputePoolBalanceWei += msg.value;

        emit EngramComputeRoyaltyDeposited(msg.sender, msg.value, modelRunId);
        return true;
    }

    /**
     * @notice Registers a verified candidate zkDID to receive algorithmic universal skill yield (aUBI)
     */
    function registerCandidateAUBI(
        address candidate,
        bytes32 zkDIDCommitment,
        uint256 engramScore
    ) external onlyController returns (bool) {
        require(!candidateYields[candidate].isRegistered, "SkillYieldVault: candidate already registered");
        require(engramScore > 0 && engramScore <= 10000, "SkillYieldVault: invalid engram score");

        candidateYields[candidate] = CandidateYieldProfile({
            zkDIDCommitment: zkDIDCommitment,
            engramContributionScore: engramScore,
            totalAccruedYieldWei: 0,
            totalClaimedYieldWei: 0,
            lastClaimTimestamp: block.timestamp,
            isRegistered: true
        });

        didToCandidate[zkDIDCommitment] = candidate;
        activeBeneficiaryCount++;

        emit CandidateRegisteredForAUBI(candidate, zkDIDCommitment, engramScore);
        return true;
    }

    /**
     * @notice Allocates continuous compute yield across registered candidate profiles
     */
    function allocateYieldBatch(
        address[] calldata candidates,
        uint256[] calldata amountsWei
    ) external onlyController returns (bool) {
        require(candidates.length == amountsWei.length, "SkillYieldVault: array length mismatch");

        for (uint256 i = 0; i < candidates.length; i++) {
            address cand = candidates[i];
            uint256 amt = amountsWei[i];

            if (candidateYields[cand].isRegistered && globalComputePoolBalanceWei >= amt) {
                candidateYields[cand].totalAccruedYieldWei += amt;
                globalComputePoolBalanceWei -= amt;
            }
        }
        return true;
    }

    /**
     * @notice Claims accrued aUBI micro-yield for the calling candidate
     */
    function claimAUBIYield() external returns (uint256) {
        CandidateYieldProfile storage profile = candidateYields[msg.sender];
        require(profile.isRegistered, "SkillYieldVault: candidate not registered for aUBI");

        uint256 claimable = profile.totalAccruedYieldWei - profile.totalClaimedYieldWei;
        require(claimable > 0, "SkillYieldVault: no claimable yield available");
        require(address(this).balance >= claimable, "SkillYieldVault: insufficient contract liquidity");

        profile.totalClaimedYieldWei += claimable;
        profile.lastClaimTimestamp = block.timestamp;
        totalAUBIDistributedWei += claimable;

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "SkillYieldVault: ETH transfer failed");

        emit AUBIYieldClaimed(msg.sender, profile.zkDIDCommitment, claimable);
        return claimable;
    }

    /**
     * @notice Views claimable aUBI yield for a candidate
     */
    function getClaimableYield(address candidate) external view returns (uint256) {
        CandidateYieldProfile storage profile = candidateYields[candidate];
        if (!profile.isRegistered) return 0;
        return profile.totalAccruedYieldWei - profile.totalClaimedYieldWei;
    }
}
