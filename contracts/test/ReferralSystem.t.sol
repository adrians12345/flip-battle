// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ReferralSystem} from "../src/ReferralSystem.sol";
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

contract ReferralSystemTest is Test {
    ReferralSystem public referralSystem;
    MockUSDC public usdc;

    address public owner = address(1);
    address public referrer = address(2);
    address public referee = address(3);
    address public referee2 = address(4);

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

    event EarningsClaimed(address indexed referrer, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mock USDC
        usdc = new MockUSDC();

        // Deploy ReferralSystem
        referralSystem = new ReferralSystem(address(usdc));

        // Fund contract for bonuses
        usdc.mint(owner, 1000 ether);
        usdc.approve(address(referralSystem), 1000 ether);
        referralSystem.fundBonuses(1000 ether);

        vm.stopPrank();
    }

    function testRegisterReferral() public {
        vm.startPrank(referee);

        vm.expectEmit(true, true, false, true);
        emit UserReferred(referee, referrer, 500_000);

        referralSystem.registerReferral(referrer);

        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        assertEq(referrerData.totalReferrals, 1);
        assertEq(referrerData.pendingEarnings, 500_000); // $0.50 signup bonus

        ReferralSystem.Referrer memory refereeData = referralSystem.getReferrer(referee);
        assertEq(refereeData.referredBy, referrer);
        assertEq(refereeData.pendingEarnings, 500_000); // Referee also gets bonus

        vm.stopPrank();
    }

    function testCannotRegisterSelf() public {
        vm.prank(referee);
        vm.expectRevert(ReferralSystem.CannotReferSelf.selector);
        referralSystem.registerReferral(referee);
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(referee);

        referralSystem.registerReferral(referrer);

        // Try to register again
        vm.expectRevert(ReferralSystem.AlreadyReferred.selector);
        referralSystem.registerReferral(referrer);

        vm.stopPrank();
    }

    function testIsReferred() public {
        assertFalse(referralSystem.isReferred(referee));

        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        assertTrue(referralSystem.isReferred(referee));
    }

    function testGetReferralChain() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        assertEq(referralSystem.getReferralChain(referee), referrer);
        assertEq(referralSystem.getReferralChain(referrer), address(0));
    }

    function testRecordFlipAndMilestone5() public {
        // Register referral
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        // Record 5 flips
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(address(this)); // Simulate FlipBattle contract
            referralSystem.recordFlip(referee);
        }

        // Check milestone bonus was awarded
        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        uint256 expectedEarnings = 500_000 + 1_000_000; // Signup + milestone5
        assertEq(referrerData.pendingEarnings, expectedEarnings);
        assertEq(referrerData.totalEarnings, expectedEarnings);

        // Check milestone claimed
        assertTrue(referralSystem.milestoneClaimed(referee, 5));
    }

    function testRecordFlipAndMilestone20() public {
        // Register referral
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        // Record 20 flips
        for (uint256 i = 0; i < 20; i++) {
            vm.prank(address(this));
            referralSystem.recordFlip(referee);
        }

        // Check both milestones awarded
        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        uint256 expectedEarnings = 500_000 + 1_000_000 + 5_000_000; // Signup + milestone5 + milestone20
        assertEq(referrerData.pendingEarnings, expectedEarnings);
        assertEq(referrerData.totalEarnings, expectedEarnings);

        assertTrue(referralSystem.milestoneClaimed(referee, 5));
        assertTrue(referralSystem.milestoneClaimed(referee, 20));
    }

    function testRecordFlipNoReferrer() public {
        // User not referred
        vm.prank(address(this));
        referralSystem.recordFlip(referee);

        // Should not revert, just return early without recording
        assertEq(referralSystem.getRefereeFlipCount(referee), 0);
        assertFalse(referralSystem.isReferred(referee));
    }

    function testClaimEarnings() public {
        // Register referral
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        uint256 balanceBefore = usdc.balanceOf(referrer);

        // Claim earnings
        vm.prank(referrer);
        vm.expectEmit(true, false, false, true);
        emit EarningsClaimed(referrer, 500_000);

        referralSystem.claimEarnings();

        assertEq(usdc.balanceOf(referrer), balanceBefore + 500_000);

        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        assertEq(referrerData.pendingEarnings, 0);
    }

    function testCannotClaimZeroEarnings() public {
        vm.prank(referrer);
        vm.expectRevert(ReferralSystem.NoPendingEarnings.selector);
        referralSystem.claimEarnings();
    }

    function testMultipleReferrals() public {
        // Referrer refers two users
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        vm.prank(referee2);
        referralSystem.registerReferral(referrer);

        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        assertEq(referrerData.totalReferrals, 2);
        assertEq(referrerData.pendingEarnings, 1_000_000); // $0.50 × 2
    }

    function testTotalReferrals() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        vm.prank(referee2);
        referralSystem.registerReferral(referrer);

        assertEq(referralSystem.totalReferrals(), 2);
    }

    function testTotalBonusesDistributed() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        // Should count both referrer and referee bonuses
        assertEq(referralSystem.totalBonusesDistributed(), 1_000_000); // $0.50 × 2

        // Add milestone bonus
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(address(this));
            referralSystem.recordFlip(referee);
        }

        assertEq(referralSystem.totalBonusesDistributed(), 2_000_000); // $1 + $1
    }

    function testGetAllReferrers() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        vm.prank(referee2);
        referralSystem.registerReferral(referrer);

        address[] memory allReferrers = referralSystem.getAllReferrers();
        assertEq(allReferrers.length, 1);
        assertEq(allReferrers[0], referrer);
    }

    function testSetBonuses() public {
        vm.prank(owner);
        referralSystem.setBonuses(
            1_000_000,  // $1 signup
            2_000_000,  // $2 milestone5
            10_000_000  // $10 milestone20
        );

        // Verify by registering a new referral with the new bonuses
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        assertEq(referrerData.pendingEarnings, 1_000_000); // New signup bonus $1
    }

    function testFundBonuses() public {
        vm.startPrank(owner);

        usdc.mint(owner, 100 ether);
        usdc.approve(address(referralSystem), 100 ether);

        uint256 contractBalanceBefore = usdc.balanceOf(address(referralSystem));
        referralSystem.fundBonuses(100 ether);

        assertEq(usdc.balanceOf(address(referralSystem)), contractBalanceBefore + 100 ether);

        vm.stopPrank();
    }

    function testGetRefereeFlipCount() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        assertEq(referralSystem.getRefereeFlipCount(referee), 0);

        for (uint256 i = 0; i < 10; i++) {
            vm.prank(address(this));
            referralSystem.recordFlip(referee);
        }

        assertEq(referralSystem.getRefereeFlipCount(referee), 10);
    }

    function testMilestoneOnlyClaimedOnce() public {
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        // Record 10 flips (includes hitting milestone at 5)
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(address(this));
            referralSystem.recordFlip(referee);
        }

        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        // Should only get milestone5 bonus once
        uint256 expectedEarnings = 500_000 + 1_000_000; // Signup + milestone5
        assertEq(referrerData.totalEarnings, expectedEarnings);
    }

    function testCompleteReferralFlow() public {
        // 1. Referee registers
        vm.prank(referee);
        referralSystem.registerReferral(referrer);

        // 2. Referee makes 20 flips (hits both milestones)
        for (uint256 i = 0; i < 20; i++) {
            vm.prank(address(this));
            referralSystem.recordFlip(referee);
        }

        // 3. Referrer claims all earnings
        ReferralSystem.Referrer memory referrerData = referralSystem.getReferrer(referrer);
        uint256 totalEarnings = referrerData.pendingEarnings;
        uint256 expectedTotal = 500_000 + 1_000_000 + 5_000_000; // $0.50 + $1 + $5 = $6.50
        assertEq(totalEarnings, expectedTotal);

        uint256 balanceBefore = usdc.balanceOf(referrer);
        vm.prank(referrer);
        referralSystem.claimEarnings();

        assertEq(usdc.balanceOf(referrer), balanceBefore + expectedTotal);

        // 4. Check final state
        referrerData = referralSystem.getReferrer(referrer);
        assertEq(referrerData.pendingEarnings, 0);
        assertEq(referrerData.totalEarnings, expectedTotal);
        assertEq(referrerData.totalReferrals, 1);
    }
}
