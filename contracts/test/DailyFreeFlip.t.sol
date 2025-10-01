// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {DailyFreeFlip} from "../src/DailyFreeFlip.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

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

contract MockVRFCoordinator is VRFCoordinatorV2Interface {
    uint256 private requestIdCounter = 1;
    mapping(uint256 => address) public requestIdToConsumer;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256 requestId) {
        requestId = requestIdCounter++;
        requestIdToConsumer[requestId] = msg.sender;
        return requestId;
    }

    function fulfillRandomWordsWithOverride(
        uint256 requestId,
        address consumer,
        uint256[] memory randomWords
    ) external {
        (bool success,) = consumer.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );
        require(success, "Callback failed");
    }

    // Required interface methods
    function getRequestConfig() external pure returns (uint16, uint32, bytes32[] memory) {
        return (0, 0, new bytes32[](0));
    }

    function createSubscription() external pure returns (uint64 subId) {
        return 1;
    }

    function getSubscription(uint64) external pure returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        return (0, 0, address(0), new address[](0));
    }

    function requestSubscriptionOwnerTransfer(uint64, address) external pure {}
    function acceptSubscriptionOwnerTransfer(uint64) external pure {}
    function addConsumer(uint64, address) external pure {}
    function removeConsumer(uint64, address) external pure {}
    function cancelSubscription(uint64, address) external pure {}
    function pendingRequestExists(uint64) external pure returns (bool) {
        return false;
    }
}

contract DailyFreeFlipTest is Test {
    DailyFreeFlip public dailyFreeFlip;
    MockUSDC public usdc;
    MockVRFCoordinator public vrfCoordinator;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);

    bytes32 public constant KEY_HASH = bytes32(uint256(1));
    uint64 public constant SUBSCRIPTION_ID = 1;

    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event UserEntered(uint256 indexed roundId, address indexed user);
    event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prizeAmount);
    event PrizePoolFunded(uint256 indexed roundId, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mocks
        usdc = new MockUSDC();
        vrfCoordinator = new MockVRFCoordinator();

        // Deploy DailyFreeFlip (starts first round automatically)
        dailyFreeFlip = new DailyFreeFlip(
            address(vrfCoordinator),
            KEY_HASH,
            SUBSCRIPTION_ID,
            address(usdc)
        );

        // Fund contract with USDC for prizes
        usdc.mint(address(dailyFreeFlip), 1000 ether);

        vm.stopPrank();
    }

    function testInitialRoundStarted() public view {
        assertEq(dailyFreeFlip.currentRoundId(), 1);

        DailyFreeFlip.Round memory round = dailyFreeFlip.getCurrentRound();
        assertEq(round.roundId, 1);
        assertEq(round.startTime, block.timestamp);
        assertEq(round.endTime, block.timestamp + 24 hours);
        assertEq(round.prizePool, 0);
        assertFalse(round.completed);
    }

    function testEnterDailyFlip() public {
        vm.startPrank(user1);

        vm.expectEmit(true, true, false, false);
        emit UserEntered(1, user1);

        dailyFreeFlip.enterDailyFlip();

        assertTrue(dailyFreeFlip.hasEnteredCurrentRound(user1));
        address[] memory participants = dailyFreeFlip.getRoundParticipants(1);
        assertEq(participants.length, 1);
        assertEq(participants[0], user1);

        vm.stopPrank();
    }

    function testMultipleUsersEnter() public {
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user2);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user3);
        dailyFreeFlip.enterDailyFlip();

        address[] memory participants = dailyFreeFlip.getRoundParticipants(1);
        assertEq(participants.length, 3);
        assertEq(participants[0], user1);
        assertEq(participants[1], user2);
        assertEq(participants[2], user3);
    }

    function testCannotEnterTwice() public {
        vm.startPrank(user1);

        dailyFreeFlip.enterDailyFlip();

        vm.expectRevert(DailyFreeFlip.AlreadyEntered.selector);
        dailyFreeFlip.enterDailyFlip();

        vm.stopPrank();
    }

    function testCannotEnterAfterRoundEnds() public {
        // Fast forward past round end
        vm.warp(block.timestamp + 25 hours);

        vm.prank(user1);
        vm.expectRevert(DailyFreeFlip.RoundNotActive.selector);
        dailyFreeFlip.enterDailyFlip();
    }

    function testGetTimeRemaining() public {
        uint256 remaining = dailyFreeFlip.getTimeRemaining();
        assertEq(remaining, 24 hours);

        vm.warp(block.timestamp + 12 hours);
        remaining = dailyFreeFlip.getTimeRemaining();
        assertEq(remaining, 12 hours);

        vm.warp(block.timestamp + 12 hours);
        remaining = dailyFreeFlip.getTimeRemaining();
        assertEq(remaining, 0);
    }

    function testAddToPrizePool() public {
        vm.prank(address(this));
        dailyFreeFlip.addToPrizePool(10 ether);

        DailyFreeFlip.Round memory round = dailyFreeFlip.getCurrentRound();
        assertEq(round.prizePool, 10 ether);
    }

    function testFundPrizePool() public {
        vm.startPrank(owner);

        usdc.mint(owner, 50 ether);
        usdc.approve(address(dailyFreeFlip), 50 ether);

        vm.expectEmit(true, false, false, true);
        emit PrizePoolFunded(1, 50 ether);

        dailyFreeFlip.fundPrizePool(50 ether);

        DailyFreeFlip.Round memory round = dailyFreeFlip.getCurrentRound();
        assertEq(round.prizePool, 50 ether);

        vm.stopPrank();
    }

    function testCannotEndRoundBeforeExpiry() public {
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.expectRevert(DailyFreeFlip.RoundNotEnded.selector);
        dailyFreeFlip.endRound();
    }

    function testCannotEndRoundWithNoParticipants() public {
        vm.warp(block.timestamp + 25 hours);

        vm.expectRevert(DailyFreeFlip.NoParticipants.selector);
        dailyFreeFlip.endRound();
    }

    function testEndRoundAndSelectWinner() public {
        // Add prize pool
        dailyFreeFlip.addToPrizePool(100 ether);

        // Users enter
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user2);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user3);
        dailyFreeFlip.enterDailyFlip();

        // Fast forward past round end
        vm.warp(block.timestamp + 25 hours);

        // End round (requests VRF)
        dailyFreeFlip.endRound();

        // Get VRF request ID (we know it's request 1)
        uint256 vrfRequestId = 1;

        // Fulfill VRF to select winner (index 1 = user2)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1; // Will select index 1 out of 3

        uint256 user2BalanceBefore = usdc.balanceOf(user2);

        vrfCoordinator.fulfillRandomWordsWithOverride(
            vrfRequestId,
            address(dailyFreeFlip),
            randomWords
        );

        // Check winner received prize
        assertEq(usdc.balanceOf(user2), user2BalanceBefore + 100 ether);

        // Check new round started
        assertEq(dailyFreeFlip.currentRoundId(), 2);
    }

    function testWinnerSelectionRandom() public {
        dailyFreeFlip.addToPrizePool(50 ether);

        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user2);
        dailyFreeFlip.enterDailyFlip();

        vm.warp(block.timestamp + 25 hours);
        dailyFreeFlip.endRound();

        uint256 vrfRequestId = 1;

        // Test different random values select different winners
        uint256[] memory randomWords = new uint256[](1);

        // Random 0 should select user1
        randomWords[0] = 0;
        vrfCoordinator.fulfillRandomWordsWithOverride(
            vrfRequestId,
            address(dailyFreeFlip),
            randomWords
        );

        // User1 should have received the prize
        assertEq(usdc.balanceOf(user1), 50 ether);
    }

    function testGetRecentWinners() public {
        // Complete multiple rounds
        uint256 vrfRequestId = 1;
        for (uint256 i = 0; i < 3; i++) {
            // Fund prize
            dailyFreeFlip.addToPrizePool(10 ether * (i + 1));

            // User enters
            vm.prank(user1);
            dailyFreeFlip.enterDailyFlip();

            // End round
            vm.warp(block.timestamp + 25 hours);
            dailyFreeFlip.endRound();

            // Fulfill VRF
            uint256[] memory randomWords = new uint256[](1);
            randomWords[0] = 0;

            vrfCoordinator.fulfillRandomWordsWithOverride(
                vrfRequestId,
                address(dailyFreeFlip),
                randomWords
            );

            vrfRequestId++;
        }

        // Get recent winners (will include current incomplete round)
        (address[] memory winners, uint256[] memory prizes) = dailyFreeFlip.getRecentWinners(3);

        assertEq(winners.length, 3);
        // Index 0 is current incomplete round (address(0))
        assertEq(winners[0], address(0));
        assertEq(prizes[0], 0);
        // Index 1 is round 3 (most recent completed)
        assertEq(winners[1], user1);
        assertEq(prizes[1], 30 ether);
        // Index 2 is round 2
        assertEq(winners[2], user1);
        assertEq(prizes[2], 20 ether);
    }

    function testHasEnteredCurrentRound() public {
        assertFalse(dailyFreeFlip.hasEnteredCurrentRound(user1));

        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        assertTrue(dailyFreeFlip.hasEnteredCurrentRound(user1));
    }

    function testNewRoundResetsEntries() public {
        // Enter round 1
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        assertTrue(dailyFreeFlip.hasEnteredCurrentRound(user1));

        // Complete round
        vm.warp(block.timestamp + 25 hours);
        dailyFreeFlip.endRound();

        uint256 vrfRequestId = 1;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0;

        vrfCoordinator.fulfillRandomWordsWithOverride(
            vrfRequestId,
            address(dailyFreeFlip),
            randomWords
        );

        // User can enter new round
        assertFalse(dailyFreeFlip.hasEnteredCurrentRound(user1));

        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        assertTrue(dailyFreeFlip.hasEnteredCurrentRound(user1));
    }

    function testGetCurrentRound() public view {
        DailyFreeFlip.Round memory round = dailyFreeFlip.getCurrentRound();

        assertEq(round.roundId, 1);
        assertEq(round.startTime, block.timestamp);
        assertEq(round.winner, address(0));
        assertFalse(round.completed);
    }

    function testRoundParticipants() public {
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.prank(user2);
        dailyFreeFlip.enterDailyFlip();

        address[] memory participants = dailyFreeFlip.getRoundParticipants(1);

        assertEq(participants.length, 2);
        assertEq(participants[0], user1);
        assertEq(participants[1], user2);
    }

    function testZeroPrizePayout() public {
        // Enter without funding prize pool
        vm.prank(user1);
        dailyFreeFlip.enterDailyFlip();

        vm.warp(block.timestamp + 25 hours);
        dailyFreeFlip.endRound();

        uint256 vrfRequestId = 1;

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0;

        uint256 balanceBefore = usdc.balanceOf(user1);

        vrfCoordinator.fulfillRandomWordsWithOverride(
            vrfRequestId,
            address(dailyFreeFlip),
            randomWords
        );

        // Should complete without error, no transfer
        assertEq(usdc.balanceOf(user1), balanceBefore); // No change

        // New round should have started
        assertEq(dailyFreeFlip.currentRoundId(), 2);
    }
}
