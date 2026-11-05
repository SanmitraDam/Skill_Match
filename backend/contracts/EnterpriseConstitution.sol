// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnterpriseConstitution
 * @notice SkillMatch DNA v8.0 — Self-Organizing Enterprise Governance Constitution
 * @dev Governs Decentralized Autonomous Teams (DATs), peer-review quorum,
 *      milestone deliverables, and dynamic skill rubric auto-evolution.
 */

contract EnterpriseConstitution {
    enum ConstitutionType { AGILE_SPRINT, WATERFALL_MILESTONE, CONTINUOUS_FLOW }
    enum MilestoneStatus  { PENDING, SUBMITTED, VERIFIED, DISPUTED, RELEASED }

    struct TeamMember {
        address wallet;
        string role;
        uint256 weightBps; // Weight in basis points (10000 = 100%)
        bool isActive;
    }

    struct Milestone {
        bytes32 milestoneId;
        string title;
        string deliverableHash; // IPFS CID or Git commit SHA
        uint256 payoutAmountUsd;
        uint256 peerReviewScoreSum;
        uint256 peerReviewCount;
        uint256 dueDate;
        MilestoneStatus status;
    }

    struct EvolvedSkill {
        string skillName;
        uint256 weightBps;
        uint256 velocityLiftBps; // e.g. 13500 = 1.35x
    }

    string public projectName;
    bytes32 public immutable teamId;
    address public immutable clientOrganization;
    address public immutable escrowContract;
    ConstitutionType public constitutionType;

    uint256 public constant PEER_REVIEW_THRESHOLD_BPS = 8000; // 80% average required
    uint256 public constant MIN_PEER_REVIEWS = 3;

    TeamMember[] public teamMembers;
    mapping(address => bool) public isMember;
    mapping(bytes32 => Milestone) public milestones;
    bytes32[] public milestoneIds;

    mapping(string => EvolvedSkill) public dynamicRubric;
    string[] public rubricSkillNames;

    event TeamMemberAdded(address indexed wallet, string role, uint256 weightBps);
    event MilestoneSubmitted(bytes32 indexed milestoneId, string deliverableHash);
    event PeerReviewRecorded(bytes32 indexed milestoneId, address indexed reviewer, uint256 scoreBps);
    event MilestoneVerified(bytes32 indexed milestoneId, uint256 avgScoreBps);
    event RubricEvolved(string skillName, uint256 newWeightBps, uint256 velocityLiftBps);

    modifier onlyMember() {
        require(isMember[msg.sender], "EnterpriseConstitution: caller not squad member");
        _;
    }

    modifier onlyClient() {
        require(msg.sender == clientOrganization, "EnterpriseConstitution: caller not client");
        _;
    }

    constructor(
        bytes32 _teamId,
        string memory _projectName,
        address _clientOrganization,
        address _escrowContract,
        ConstitutionType _constitutionType
    ) {
        teamId = _teamId;
        projectName = _projectName;
        clientOrganization = _clientOrganization;
        escrowContract = _escrowContract;
        constitutionType = _constitutionType;
    }

    function addTeamMember(address _wallet, string memory _role, uint256 _weightBps) external onlyClient {
        require(!isMember[_wallet], "Already a squad member");
        teamMembers.push(TeamMember({
            wallet: _wallet,
            role: _role,
            weightBps: _weightBps,
            isActive: true
        }));
        isMember[_wallet] = true;
        emit TeamMemberAdded(_wallet, _role, _weightBps);
    }

    function addMilestone(
        bytes32 _milestoneId,
        string memory _title,
        uint256 _payoutAmountUsd,
        uint256 _dueDate
    ) external onlyClient {
        require(milestones[_milestoneId].dueDate == 0, "Milestone already exists");
        milestones[_milestoneId] = Milestone({
            milestoneId: _milestoneId,
            title: _title,
            deliverableHash: "",
            payoutAmountUsd: _payoutAmountUsd,
            peerReviewScoreSum: 0,
            peerReviewCount: 0,
            dueDate: _dueDate,
            status: MilestoneStatus.PENDING
        });
        milestoneIds.push(_milestoneId);
    }

    function submitDeliverable(bytes32 _milestoneId, string memory _deliverableHash) external onlyMember {
        Milestone storage m = milestones[_milestoneId];
        require(m.status == MilestoneStatus.PENDING, "Milestone not pending");
        m.deliverableHash = _deliverableHash;
        m.status = MilestoneStatus.SUBMITTED;
        emit MilestoneSubmitted(_milestoneId, _deliverableHash);
    }

    function recordPeerReview(bytes32 _milestoneId, uint256 _scoreBps) external onlyMember {
        Milestone storage m = milestones[_milestoneId];
        require(m.status == MilestoneStatus.SUBMITTED, "Milestone not submitted");
        require(_scoreBps <= 10000, "Score exceeds 100%");

        m.peerReviewScoreSum += _scoreBps;
        m.peerReviewCount += 1;
        emit PeerReviewRecorded(_milestoneId, msg.sender, _scoreBps);

        if (m.peerReviewCount >= MIN_PEER_REVIEWS) {
            uint256 avgScore = m.peerReviewScoreSum / m.peerReviewCount;
            if (avgScore >= PEER_REVIEW_THRESHOLD_BPS) {
                m.status = MilestoneStatus.VERIFIED;
                emit MilestoneVerified(_milestoneId, avgScore);
            }
        }
    }

    function evolveSkillRubric(string memory _skillName, uint256 _newWeightBps, uint256 _velocityLiftBps) external onlyClient {
        if (dynamicRubric[_skillName].weightBps == 0) {
            rubricSkillNames.push(_skillName);
        }
        dynamicRubric[_skillName] = EvolvedSkill({
            skillName: _skillName,
            weightBps: _newWeightBps,
            velocityLiftBps: _velocityLiftBps
        });
        emit RubricEvolved(_skillName, _newWeightBps, _velocityLiftBps);
    }

    function getTeamCount() external view returns (uint256) {
        return teamMembers.length;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestoneIds.length;
    }
}
