// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StreakManager
 * @notice Manages daily check-ins and streak rewards for engagement
 * @dev Users check in daily (gas only) and unlock USDC rewards at milestones
 */
contract StreakManager is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    struct Streak {
        uint256 currentStreak;      // Current consecutive days
        uint256 lastCheckIn;        // Timestamp of last check-in
        uint256 longestStreak;      // All-time longest streak
        uint256 totalCheckIns;      // Total number of check-ins
        uint256 availableCredits;   // Free flip credits earned (in USDC)
    }

    // Reward milestones (day => USDC amount in 6 decimals)
    mapping(uint256 => uint256) public streakRewards;
    mapping(address => Streak) public streaks;
    mapping(address => mapping(uint256 => bool)) public rewardsClaimed;  // user => day => claimed

    uint256 public constant ONE_DAY = 24 hours;
    uint256 public totalCreditsDistributed;

    // Events
    event CheckedIn(
        address indexed user,
        uint256 currentStreak,
        uint256 timestamp
    );

    event RewardClaimed(
        address indexed user,
        uint256 day,
        uint256 amount
    );

    event StreakBroken(
        address indexed user,
        uint256 previousStreak
    );

    // Errors
    error AlreadyCheckedInToday();
    error RewardNotUnlocked();
    error RewardAlreadyClaimed();
    error InsufficientBalance();
    error TransferFailed();

    /**
     * @notice Constructor
     * @param _usdc USDC token address
     */
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);

        // Set default rewards (in USDC with 6 decimals)
        streakRewards[7] = 3_000_000;   // Day 7: $3
        streakRewards[14] = 10_000_000;  // Day 14: $10
        streakRewards[30] = 20_000_000;  // Day 30: $20
    }

    /**
     * @notice Check in for the day (gas only transaction)
     */
    function checkIn() external {
        Streak storage streak = streaks[msg.sender];

        // Check if already checked in today (skip check for first check-in)
        if (streak.lastCheckIn != 0) {
            uint256 timeSinceLastCheckIn = block.timestamp - streak.lastCheckIn;

            if (timeSinceLastCheckIn < ONE_DAY) {
                revert AlreadyCheckedInToday();
            }

            // If more than 48 hours, streak is broken
            if (timeSinceLastCheckIn > ONE_DAY * 2 && streak.currentStreak > 0) {
                emit StreakBroken(msg.sender, streak.currentStreak);
                streak.currentStreak = 0;
            }
        }

        // Increment streak
        streak.currentStreak++;
        streak.lastCheckIn = block.timestamp;
        streak.totalCheckIns++;

        // Update longest streak
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        emit CheckedIn(msg.sender, streak.currentStreak, block.timestamp);
    }

    /**
     * @notice Claim reward for reaching a milestone
     * @param day Milestone day (7, 14, or 30)
     */
    function claimReward(uint256 day) external nonReentrant {
        Streak storage streak = streaks[msg.sender];

        // Check if reward exists for this day
        uint256 rewardAmount = streakRewards[day];
        if (rewardAmount == 0) revert RewardNotUnlocked();

        // Check if user has reached this milestone
        if (streak.currentStreak < day) revert RewardNotUnlocked();

        // Check if already claimed
        if (rewardsClaimed[msg.sender][day]) revert RewardAlreadyClaimed();

        // Mark as claimed
        rewardsClaimed[msg.sender][day] = true;

        // Add credits to user's balance
        streak.availableCredits += rewardAmount;
        totalCreditsDistributed += rewardAmount;

        emit RewardClaimed(msg.sender, day, rewardAmount);
    }

    /**
     * @notice Use credits for a flip (called by FlipBattle contract)
     * @param user User spending credits
     * @param amount Amount to spend
     */
    function useCredits(address user, uint256 amount) external {
        Streak storage streak = streaks[user];

        if (streak.availableCredits < amount) revert InsufficientBalance();

        streak.availableCredits -= amount;
    }

    /**
     * @notice Fund the contract with USDC for rewards (owner only)
     * @param amount Amount of USDC to fund
     */
    function fundRewards(uint256 amount) external onlyOwner {
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Update reward amount for a milestone (owner only)
     * @param day Milestone day
     * @param amount Reward amount in USDC (6 decimals)
     */
    function setStreakReward(uint256 day, uint256 amount) external onlyOwner {
        streakRewards[day] = amount;
    }

    /**
     * @notice Get user's streak info
     * @param user Address of the user
     */
    function getStreak(address user) external view returns (Streak memory) {
        return streaks[user];
    }

    /**
     * @notice Check if user can check in
     * @param user Address of the user
     */
    function canCheckIn(address user) external view returns (bool) {
        if (streaks[user].lastCheckIn == 0) return true; // First check-in
        uint256 timeSinceLastCheckIn = block.timestamp - streaks[user].lastCheckIn;
        return timeSinceLastCheckIn >= ONE_DAY;
    }

    /**
     * @notice Get available rewards for user
     * @param user Address of the user
     */
    function getAvailableRewards(address user) external view returns (
        uint256[] memory,
        uint256[] memory,
        bool[] memory
    ) {
        uint256[] memory allDays = new uint256[](3);
        allDays[0] = 7;
        allDays[1] = 14;
        allDays[2] = 30;

        uint256[] memory rewardDays = new uint256[](3);
        uint256[] memory rewardAmounts = new uint256[](3);
        bool[] memory claimedStatus = new bool[](3);

        for (uint256 i = 0; i < 3; i++) {
            uint256 day = allDays[i];
            rewardDays[i] = day;
            rewardAmounts[i] = streakRewards[day];
            claimedStatus[i] = rewardsClaimed[user][day];
        }

        return (rewardDays, rewardAmounts, claimedStatus);
    }
}
