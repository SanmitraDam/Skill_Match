// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillMicroRoyalty
 * @notice SkillMatch DNA v9.0 — Universal SkillOS Autonomous Micro-Royalty Distribution Engine
 * @dev Manages monetizable skill node indexing and real-time USDC/EURC stablecoin
 *      micro-royalty disbursements when global swarms or enterprise teams build on candidate assets.
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IzkDIDRegistry {
    function getPayoutAddress(bytes32 _zkDidHash) external view returns (address);
}

contract SkillMicroRoyalty {
    struct SkillNode {
        bytes32 nodeHash;
        bytes32 creatorZkDidHash;
        string assetCid; // IPFS CID of blueprint or code module
        uint256 royaltyPerUseUnits; // In stablecoin units (e.g. 2500000 = 2.50 USDC)
        uint256 totalUses;
        uint256 cumulativeEarningsUnits;
        bool isActive;
    }

    address public owner;
    address public immutable stablecoinToken; // USDC (6 decimals)
    address public immutable zkDidRegistry;
    bool public isPaused;

    mapping(bytes32 => SkillNode) public skillNodes;
    bytes32[] public registeredNodeHashes;

    event SkillNodeRegistered(bytes32 indexed nodeHash, bytes32 indexed creatorZkDidHash, uint256 royaltyPerUseUnits);
    event MicroRoyaltyDisbursed(bytes32 indexed nodeHash, address indexed recipient, uint256 amountUnits, address indexed consumer);
    event RoyaltyRateUpdated(bytes32 indexed nodeHash, uint256 newRateUnits);
    event EmergencyPaused(bool paused);

    modifier onlyOwner() {
        require(msg.sender == owner, "SkillMicroRoyalty: caller not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "SkillMicroRoyalty: contract paused");
        _;
    }

    constructor(address _stablecoinToken, address _zkDidRegistry) {
        owner = msg.sender;
        stablecoinToken = _stablecoinToken;
        zkDidRegistry = _zkDidRegistry;
    }

    function registerSkillNode(
        bytes32 _nodeHash,
        bytes32 _creatorZkDidHash,
        string memory _assetCid,
        uint256 _royaltyPerUseUnits
    ) external whenNotPaused {
        require(!skillNodes[_nodeHash].isActive, "SkillMicroRoyalty: node already registered");
        require(_royaltyPerUseUnits > 0, "SkillMicroRoyalty: royalty must be > 0");

        skillNodes[_nodeHash] = SkillNode({
            nodeHash: _nodeHash,
            creatorZkDidHash: _creatorZkDidHash,
            assetCid: _assetCid,
            royaltyPerUseUnits: _royaltyPerUseUnits,
            totalUses: 0,
            cumulativeEarningsUnits: 0,
            isActive: true
        });

        registeredNodeHashes.push(_nodeHash);
        emit SkillNodeRegistered(_nodeHash, _creatorZkDidHash, _royaltyPerUseUnits);
    }

    function disburseMicroRoyalty(bytes32 _nodeHash, uint256 _usageCount) external whenNotPaused {
        SkillNode storage node = skillNodes[_nodeHash];
        require(node.isActive, "SkillMicroRoyalty: node not active");
        require(_usageCount > 0, "SkillMicroRoyalty: usage count must be > 0");

        address recipient = IzkDIDRegistry(zkDidRegistry).getPayoutAddress(node.creatorZkDidHash);
        require(recipient != address(0), "SkillMicroRoyalty: invalid creator payout address");

        uint256 payoutTotal = node.royaltyPerUseUnits * _usageCount;
        node.totalUses += _usageCount;
        node.cumulativeEarningsUnits += payoutTotal;

        // Pull payment from consumer and disburse directly to creator wallet
        require(IERC20(stablecoinToken).transferFrom(msg.sender, recipient, payoutTotal), "Stablecoin royalty transfer failed");

        emit MicroRoyaltyDisbursed(_nodeHash, recipient, payoutTotal, msg.sender);
    }

    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
        emit EmergencyPaused(_paused);
    }

    function getNodeCount() external view returns (uint256) {
        return registeredNodeHashes.length;
    }
}
