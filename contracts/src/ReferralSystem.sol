// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReferralSystem
 * @notice Manages referral tracking and bonus distribution for viral growth
 * @dev Referrers earn bonuses when referred users sign up and play games
 */
contract ReferralSystem is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    struct Referrer {
        address referredBy;         // Who referred this user
        uint256 totalReferrals;     // Number of users referred
        uint256 totalEarnings;      // Total USDC earned from referrals
        uint256 pendingEarnings;    // Unclaimed earnings
    }

    struct ReferralBonuses {
        uint256 signupBonus;        // Bonus for signup (each)
        uint256 milestone5Bonus;    // Bonus when referee reaches 5 flips
        uint256 milestone20Bonus;   // Bonus when referee reaches 20 flips
    }

    mapping(address => Referrer) public referrers;
    mapping(address => uint256) public refereeFlipCount;  // Track flips of referred users
    mapping(address => mapping(uint256 => bool)) public milestoneClaimed;  // referee => milestone => claimed

    ReferralBonuses public bonuses;
    address[] public allReferrers;
    uint256 public totalReferrals;
    uint256 public totalBonusesDistributed;

    // Events
    event UserReferred(
        address indexed referee,
        address indexed referrer,
        uint256 signupBonus
    );

    event MilestoneReached(
        address indexed referee,
        address indexed referrer,
        uint256 milestone,
        uint256 bonus
    );

    event EarningsClaimed(
        address indexed referrer,
        uint256 amount
    );

    // Errors
    error AlreadyReferred();
    error CannotReferSelf();
    error MilestoneNotReached();
    error MilestoneAlreadyClaimed();
    error NoPendingEarnings();
    error TransferFailed();

    /**
     * @notice Constructor
     * @param _usdc USDC token address
     */
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);

        // Set default bonuses (in USDC with 6 decimals)
        bonuses = ReferralBonuses({
            signupBonus: 500_000,      // $0.50 each (referrer + referee)
            milestone5Bonus: 1_000_000,  // $1.00 at 5 flips
            milestone20Bonus: 5_000_000  // $5.00 at 20 flips
        });
    }

    /**
     * @notice Register a referral relationship
     * @param referrer Address of the referrer
     */
    function registerReferral(address referrer) external {
        if (referrer == msg.sender) revert CannotReferSelf();
        if (referrers[msg.sender].referredBy != address(0)) revert AlreadyReferred();

        // Record referral
        referrers[msg.sender].referredBy = referrer;
        referrers[referrer].totalReferrals++;
        totalReferrals++;

        // Add to referrers list if first referral
        if (referrers[referrer].totalReferrals == 1) {
            allReferrers.push(referrer);
        }

        // Award signup bonus to both parties
        uint256 bonus = bonuses.signupBonus;
        referrers[referrer].pendingEarnings += bonus;
        referrers[referrer].totalEarnings += bonus;
        referrers[msg.sender].pendingEarnings += bonus;  // Referee gets bonus too
        referrers[msg.sender].totalEarnings += bonus;

        totalBonusesDistributed += bonus * 2;

        emit UserReferred(msg.sender, referrer, bonus);
    }

    /**
     * @notice Record a flip by a referred user (called by FlipBattle contract)
     * @param user Address of the user who flipped
     */
    function recordFlip(address user) external {
        address referrer = referrers[user].referredBy;
        if (referrer == address(0)) return;  // Not referred

        refereeFlipCount[user]++;
        uint256 flipCount = refereeFlipCount[user];

        // Check for milestone bonuses
        if (flipCount == 5 && !milestoneClaimed[user][5]) {
            _awardMilestoneBonus(user, referrer, 5, bonuses.milestone5Bonus);
        } else if (flipCount == 20 && !milestoneClaimed[user][20]) {
            _awardMilestoneBonus(user, referrer, 20, bonuses.milestone20Bonus);
        }
    }

    /**
     * @notice Internal function to award milestone bonus
     */
    function _awardMilestoneBonus(
        address referee,
        address referrer,
        uint256 milestone,
        uint256 bonus
    ) internal {
        milestoneClaimed[referee][milestone] = true;
        referrers[referrer].pendingEarnings += bonus;
        referrers[referrer].totalEarnings += bonus;
        totalBonusesDistributed += bonus;

        emit MilestoneReached(referee, referrer, milestone, bonus);
    }

    /**
     * @notice Claim pending referral earnings
     */
    function claimEarnings() external nonReentrant {
        uint256 pending = referrers[msg.sender].pendingEarnings;
        if (pending == 0) revert NoPendingEarnings();

        referrers[msg.sender].pendingEarnings = 0;

        if (!usdc.transfer(msg.sender, pending)) {
            revert TransferFailed();
        }

        emit EarningsClaimed(msg.sender, pending);
    }

    /**
     * @notice Fund the contract with USDC for bonuses (owner only)
     * @param amount Amount of USDC to fund
     */
    function fundBonuses(uint256 amount) external onlyOwner {
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Update referral bonuses (owner only)
     * @param signupBonus New signup bonus
     * @param milestone5Bonus New 5-flip milestone bonus
     * @param milestone20Bonus New 20-flip milestone bonus
     */
    function setBonuses(
        uint256 signupBonus,
        uint256 milestone5Bonus,
        uint256 milestone20Bonus
    ) external onlyOwner {
        bonuses.signupBonus = signupBonus;
        bonuses.milestone5Bonus = milestone5Bonus;
        bonuses.milestone20Bonus = milestone20Bonus;
    }

    /**
     * @notice Get referrer info
     * @param referrer Address of the referrer
     */
    function getReferrer(address referrer) external view returns (Referrer memory) {
        return referrers[referrer];
    }

    /**
     * @notice Get referee's flip count
     * @param referee Address of the referee
     */
    function getRefereeFlipCount(address referee) external view returns (uint256) {
        return refereeFlipCount[referee];
    }

    /**
     * @notice Get all referrers (for leaderboard)
     */
    function getAllReferrers() external view returns (address[] memory) {
        return allReferrers;
    }

    /**
     * @notice Check if user has been referred
     * @param user Address of the user
     */
    function isReferred(address user) external view returns (bool) {
        return referrers[user].referredBy != address(0);
    }

    /**
     * @notice Get referral chain (who referred this user)
     * @param user Address of the user
     */
    function getReferralChain(address user) external view returns (address) {
        return referrers[user].referredBy;
    }
}
