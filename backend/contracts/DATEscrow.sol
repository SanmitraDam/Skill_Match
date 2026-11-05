// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DATEscrow
 * @notice SkillMatch DNA v8.0 — Decentralized Autonomous Team Smart Escrow
 * @dev Manages USDC/EURC stablecoin locking, milestone release upon peer-review verification,
 *      and automated micro-disbursements for cross-border engineering squads.
 */

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IEnterpriseConstitution {
    function clientOrganization() external view returns (address);
    function isMember(address account) external view returns (bool);
}

contract DATEscrow {
    address public immutable constitutionAddress;
    address public immutable stablecoinToken; // e.g. USDC (6 decimals)
    address public arbitrator;
    bool public isPaused;

    struct EscrowDeposit {
        uint256 totalAmountLocked;
        uint256 amountReleased;
        bool isSettled;
    }

    EscrowDeposit public escrowDetails;

    event EscrowFunded(address indexed funder, uint256 amount);
    event MilestonePayoutReleased(bytes32 indexed milestoneId, address indexed recipient, uint256 amount);
    event EmergencyPaused(address indexed arbitrator);
    event EmergencyUnpaused(address indexed arbitrator);

    modifier onlyClient() {
        require(msg.sender == IEnterpriseConstitution(constitutionAddress).clientOrganization(), "DATEscrow: caller not client");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "DATEscrow: caller not arbitrator");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "DATEscrow: contract paused");
        _;
    }

    constructor(address _constitutionAddress, address _stablecoinToken, address _arbitrator) {
        constitutionAddress = _constitutionAddress;
        stablecoinToken = _stablecoinToken;
        arbitrator = _arbitrator;
    }

    function fundEscrow(uint256 _amount) external onlyClient {
        require(_amount > 0, "Amount must be > 0");
        require(IERC20(stablecoinToken).transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        escrowDetails.totalAmountLocked += _amount;
        emit EscrowFunded(msg.sender, _amount);
    }

    function releaseMilestoneDisbursement(
        bytes32 _milestoneId,
        address _recipient,
        uint256 _amount
    ) external onlyClient whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        require(escrowDetails.totalAmountLocked >= escrowDetails.amountReleased + _amount, "Insufficient escrow balance");
        require(IEnterpriseConstitution(constitutionAddress).isMember(_recipient), "Recipient not squad member");

        escrowDetails.amountReleased += _amount;
        if (escrowDetails.amountReleased == escrowDetails.totalAmountLocked) {
            escrowDetails.isSettled = true;
        }

        require(IERC20(stablecoinToken).transfer(_recipient, _amount), "Stablecoin disbursement failed");
        emit MilestonePayoutReleased(_milestoneId, _recipient, _amount);
    }

    function setPaused(bool _paused) external onlyArbitrator {
        isPaused = _paused;
        if (_paused) {
            emit EmergencyPaused(msg.sender);
        } else {
            emit EmergencyUnpaused(msg.sender);
        }
    }

    function getEscrowBalance() external view returns (uint256) {
        return IERC20(stablecoinToken).balanceOf(address(this));
    }
}
