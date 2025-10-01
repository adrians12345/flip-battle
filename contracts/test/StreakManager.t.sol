// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {StreakManager} from "../src/StreakManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUSDC is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
}

contract StreakManagerTest is Test {
    StreakManager public streakManager;
    MockUSDC public usdc;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    event CheckedIn(address indexed user, uint256 currentStreak, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 day, uint256 amount);
    event StreakBroken(address indexed user, uint256 previousStreak);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mock USDC
        usdc = new MockUSDC();

        // Deploy StreakManager
        streakManager = new StreakManager(address(usdc));

        // Fund contract for rewards
        usdc.mint(owner, 1000 ether);
        usdc.approve(address(streakManager), 1000 ether);
        streakManager.fundRewards(1000 ether);

        vm.stopPrank();
    }

    function testFirstCheckIn() public {
        vm.startPrank(user1);

        vm.expectEmit(true, false, false, true);
        emit CheckedIn(user1, 1, block.timestamp);

        streakManager.checkIn();

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 1);
        assertEq(streak.lastCheckIn, block.timestamp);
        assertEq(streak.longestStreak, 1);
        assertEq(streak.totalCheckIns, 1);

        vm.stopPrank();
    }

    function testConsecutiveCheckIns() public {
        vm.startPrank(user1);

        // Day 1
        streakManager.checkIn();

        // Day 2
        vm.warp(block.timestamp + 1 days);
        streakManager.checkIn();

        // Day 3
        vm.warp(block.timestamp + 1 days);
        streakManager.checkIn();

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 3);
        assertEq(streak.longestStreak, 3);
        assertEq(streak.totalCheckIns, 3);

        vm.stopPrank();
    }

    function testCannotCheckInTwiceInOneDay() public {
        vm.startPrank(user1);

        streakManager.checkIn();

        // Try to check in again immediately
        vm.expectRevert(StreakManager.AlreadyCheckedInToday.selector);
        streakManager.checkIn();

        // Try to check in 23 hours later (still < 24 hours)
        vm.warp(block.timestamp + 23 hours);
        vm.expectRevert(StreakManager.AlreadyCheckedInToday.selector);
        streakManager.checkIn();

        vm.stopPrank();
    }

    function testStreakBreaks() public {
        vm.startPrank(user1);

        // Build a streak
        streakManager.checkIn();
        vm.warp(block.timestamp + 1 days);
        streakManager.checkIn();
        vm.warp(block.timestamp + 1 days);
        streakManager.checkIn();

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 3);

        // Wait more than 48 hours (streak breaks)
        vm.warp(block.timestamp + 3 days);

        vm.expectEmit(true, false, false, true);
        emit StreakBroken(user1, 3);

        streakManager.checkIn();

        streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 1); // Reset to 1
        assertEq(streak.longestStreak, 3); // Longest is preserved
        assertEq(streak.totalCheckIns, 4);

        vm.stopPrank();
    }

    function testCanCheckIn() public {
        vm.startPrank(user1);

        assertTrue(streakManager.canCheckIn(user1));

        streakManager.checkIn();
        assertFalse(streakManager.canCheckIn(user1));

        vm.warp(block.timestamp + 1 days);
        assertTrue(streakManager.canCheckIn(user1));

        vm.stopPrank();
    }

    function testClaimReward7Days() public {
        vm.startPrank(user1);

        // Build 7-day streak
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 7);

        // Claim 7-day reward
        uint256 expectedReward = 3_000_000; // $3

        vm.expectEmit(true, false, false, true);
        emit RewardClaimed(user1, 7, expectedReward);

        streakManager.claimReward(7);

        streak = streakManager.getStreak(user1);
        assertEq(streak.availableCredits, expectedReward);

        vm.stopPrank();
    }

    function testClaimReward14Days() public {
        vm.startPrank(user1);

        // Build 14-day streak
        for (uint256 i = 0; i < 14; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Claim both 7-day and 14-day rewards
        streakManager.claimReward(7);
        streakManager.claimReward(14);

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        uint256 expectedTotal = 3_000_000 + 10_000_000; // $3 + $10 = $13
        assertEq(streak.availableCredits, expectedTotal);

        vm.stopPrank();
    }

    function testClaimReward30Days() public {
        vm.startPrank(user1);

        // Build 30-day streak
        for (uint256 i = 0; i < 30; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Claim all rewards
        streakManager.claimReward(7);
        streakManager.claimReward(14);
        streakManager.claimReward(30);

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        uint256 expectedTotal = 3_000_000 + 10_000_000 + 20_000_000; // $3 + $10 + $20 = $33
        assertEq(streak.availableCredits, expectedTotal);

        vm.stopPrank();
    }

    function testCannotClaimRewardNotUnlocked() public {
        vm.startPrank(user1);

        // Only check in 5 days
        for (uint256 i = 0; i < 5; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Try to claim 7-day reward
        vm.expectRevert(StreakManager.RewardNotUnlocked.selector);
        streakManager.claimReward(7);

        vm.stopPrank();
    }

    function testCannotClaimRewardTwice() public {
        vm.startPrank(user1);

        // Build 7-day streak
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Claim reward
        streakManager.claimReward(7);

        // Try to claim again
        vm.expectRevert(StreakManager.RewardAlreadyClaimed.selector);
        streakManager.claimReward(7);

        vm.stopPrank();
    }

    function testCannotClaimNonexistentReward() public {
        vm.startPrank(user1);

        // Build 10-day streak
        for (uint256 i = 0; i < 10; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Try to claim reward for day 10 (doesn't exist)
        vm.expectRevert(StreakManager.RewardNotUnlocked.selector);
        streakManager.claimReward(10);

        vm.stopPrank();
    }

    function testUseCredits() public {
        vm.startPrank(user1);

        // Build streak and claim reward
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }
        streakManager.claimReward(7);

        uint256 creditsBefore = streakManager.getStreak(user1).availableCredits;
        vm.stopPrank();

        // External contract uses credits
        vm.prank(address(this));
        streakManager.useCredits(user1, 1_000_000); // Use $1

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.availableCredits, creditsBefore - 1_000_000);
    }

    function testCannotUseMoreCreditsThanAvailable() public {
        vm.startPrank(user1);

        // Build streak and claim reward
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }
        streakManager.claimReward(7); // $3 in credits
        vm.stopPrank();

        // Try to use more than available
        vm.prank(address(this));
        vm.expectRevert(StreakManager.InsufficientBalance.selector);
        streakManager.useCredits(user1, 4_000_000); // Try to use $4
    }

    function testGetAvailableRewards() public {
        vm.startPrank(user1);

        // Build 14-day streak
        for (uint256 i = 0; i < 14; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        // Claim 7-day reward only
        streakManager.claimReward(7);

        (
            uint256[] memory rewardDays,
            uint256[] memory rewardAmounts,
            bool[] memory claimedStatus
        ) = streakManager.getAvailableRewards(user1);

        assertEq(rewardDays.length, 3);
        assertEq(rewardDays[0], 7);
        assertEq(rewardDays[1], 14);
        assertEq(rewardDays[2], 30);

        assertEq(rewardAmounts[0], 3_000_000);
        assertEq(rewardAmounts[1], 10_000_000);
        assertEq(rewardAmounts[2], 20_000_000);

        assertTrue(claimedStatus[0]); // 7-day claimed
        assertFalse(claimedStatus[1]); // 14-day not claimed
        assertFalse(claimedStatus[2]); // 30-day not claimed

        vm.stopPrank();
    }

    function testSetStreakReward() public {
        vm.prank(owner);
        streakManager.setStreakReward(7, 5_000_000); // Change 7-day to $5

        assertEq(streakManager.streakRewards(7), 5_000_000);
    }

    function testFundRewards() public {
        vm.startPrank(owner);

        usdc.mint(owner, 100 ether);
        usdc.approve(address(streakManager), 100 ether);

        uint256 contractBalanceBefore = usdc.balanceOf(address(streakManager));
        streakManager.fundRewards(100 ether);

        assertEq(usdc.balanceOf(address(streakManager)), contractBalanceBefore + 100 ether);

        vm.stopPrank();
    }

    function testTotalCreditsDistributed() public {
        vm.startPrank(user1);

        // Build 7-day streak
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }
        streakManager.claimReward(7);
        vm.stopPrank();

        vm.startPrank(user2);

        // Build 7-day streak
        for (uint256 i = 0; i < 7; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }
        streakManager.claimReward(7);
        vm.stopPrank();

        // Total should be $6 (2 users × $3)
        assertEq(streakManager.totalCreditsDistributed(), 6_000_000);
    }

    function testLongestStreakPreserved() public {
        vm.startPrank(user1);

        // Build 10-day streak
        for (uint256 i = 0; i < 10; i++) {
            streakManager.checkIn();
            vm.warp(block.timestamp + 1 days);
        }

        StreakManager.Streak memory streak = streakManager.getStreak(user1);
        assertEq(streak.longestStreak, 10);

        // Break streak
        vm.warp(block.timestamp + 3 days);
        streakManager.checkIn();

        // Build another streak
        vm.warp(block.timestamp + 1 days);
        streakManager.checkIn();

        streak = streakManager.getStreak(user1);
        assertEq(streak.currentStreak, 2);
        assertEq(streak.longestStreak, 10); // Still preserved

        vm.stopPrank();
    }
}
