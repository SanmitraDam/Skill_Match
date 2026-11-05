// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title zkDIDRegistry
 * @notice SkillMatch DNA v9.0 — Universal SkillOS Zero-Knowledge Decentralized Identity Registry
 * @dev Manages anonymous, self-sovereign zkDIDs and on-chain credential reputation
 *      without exposing candidate personal identification or demographic data.
 */

contract zkDIDRegistry {
    struct ZKCredential {
        bytes32 credentialTypeHash;
        uint256 scoreBps; // 10000 = 100%
        bytes32 proofHash;
        uint256 issuedAt;
        bool isValid;
    }

    struct DIDDocument {
        bytes32 zkDidHash;
        address payoutAddress;
        uint256 accruedReputationScore; // 300 to 1000
        uint256 credentialCount;
        bool isRegistered;
    }

    address public owner;
    mapping(bytes32 => DIDDocument) public didDocuments;
    mapping(bytes32 => mapping(bytes32 => ZKCredential)) public credentials; // didHash => credTypeHash => Credential
    mapping(address => bool) public authorizedIssuers;

    event ZKDIDRegistered(bytes32 indexed zkDidHash, address indexed payoutAddress);
    event ReputationAccrued(bytes32 indexed zkDidHash, bytes32 indexed credentialTypeHash, uint256 scoreBps, uint256 newReputation);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "zkDIDRegistry: caller not owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "zkDIDRegistry: caller not authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function setIssuer(address _issuer, bool _authorized) external onlyOwner {
        authorizedIssuers[_issuer] = _authorized;
        if (_authorized) {
            emit IssuerAuthorized(_issuer);
        } else {
            emit IssuerRevoked(_issuer);
        }
    }

    function registerZKDID(bytes32 _zkDidHash, address _payoutAddress) external {
        require(!didDocuments[_zkDidHash].isRegistered, "zkDIDRegistry: already registered");
        require(_payoutAddress != address(0), "zkDIDRegistry: invalid payout address");

        didDocuments[_zkDidHash] = DIDDocument({
            zkDidHash: _zkDidHash,
            payoutAddress: _payoutAddress,
            accruedReputationScore: 500, // Initial baseline score
            credentialCount: 0,
            isRegistered: true
        });

        emit ZKDIDRegistered(_zkDidHash, _payoutAddress);
    }

    function accrueReputation(
        bytes32 _zkDidHash,
        bytes32 _credentialTypeHash,
        uint256 _scoreBps,
        bytes32 _proofHash
    ) external onlyIssuer {
        require(didDocuments[_zkDidHash].isRegistered, "zkDIDRegistry: DID not registered");
        require(_scoreBps <= 10000, "zkDIDRegistry: score exceeds 100%");

        credentials[_zkDidHash][_credentialTypeHash] = ZKCredential({
            credentialTypeHash: _credentialTypeHash,
            scoreBps: _scoreBps,
            proofHash: _proofHash,
            issuedAt: block.timestamp,
            isValid: true
        });

        DIDDocument storage doc = didDocuments[_zkDidHash];
        doc.credentialCount += 1;

        // Reputation score formula: min(1000, current + score/150)
        uint256 lift = _scoreBps / 150;
        doc.accruedReputationScore = (doc.accruedReputationScore + lift > 1000) ? 1000 : (doc.accruedReputationScore + lift);

        emit ReputationAccrued(_zkDidHash, _credentialTypeHash, _scoreBps, doc.accruedReputationScore);
    }

    function getDIDReputation(bytes32 _zkDidHash) external view returns (uint256) {
        require(didDocuments[_zkDidHash].isRegistered, "zkDIDRegistry: DID not registered");
        return didDocuments[_zkDidHash].accruedReputationScore;
    }

    function getPayoutAddress(bytes32 _zkDidHash) external view returns (address) {
        require(didDocuments[_zkDidHash].isRegistered, "zkDIDRegistry: DID not registered");
        return didDocuments[_zkDidHash].payoutAddress;
    }
}
