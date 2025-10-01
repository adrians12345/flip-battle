// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {FlipBattle} from "../src/FlipBattle.sol";
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
        // Simulate VRF callback
        (bool success,) = consumer.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );
        require(success, "Callback failed");
    }

    // Required interface methods (unused in tests)
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

contract FlipBattleTest is Test {
    FlipBattle public flipBattle;
    MockUSDC public usdc;
    MockVRFCoordinator public vrfCoordinator;

    address public owner = address(1);
    address public player1 = address(2);
    address public player2 = address(3);
    address public player3 = address(4);

    bytes32 public constant KEY_HASH = bytes32(uint256(1));
    uint64 public constant SUBSCRIPTION_ID = 1;
    uint256 public constant BET_AMOUNT = 1 ether; // 1 USDC (6 decimals)

    event ChallengeCreated(
        uint256 indexed gameId,
        address indexed player1,
        address indexed player2,
        uint256 betAmount,
        FlipBattle.CoinSide player1Call
    );

    event ChallengeAccepted(
        uint256 indexed gameId,
        address indexed player2,
        uint256 vrfRequestId
    );

    event GameCompleted(
        uint256 indexed gameId,
        address indexed winner,
        address indexed loser,
        FlipBattle.CoinSide result,
        uint256 payout
    );

    function setUp() public {
        vm.startPrank(owner);

        // Deploy mocks
        usdc = new MockUSDC();
        vrfCoordinator = new MockVRFCoordinator();

        // Deploy FlipBattle
        flipBattle = new FlipBattle(
            address(vrfCoordinator),
            KEY_HASH,
            SUBSCRIPTION_ID,
            address(usdc)
        );

        // Mint USDC to players
        usdc.mint(player1, 100 ether);
        usdc.mint(player2, 100 ether);
        usdc.mint(player3, 100 ether);

        vm.stopPrank();
    }

    function testCreateChallenge() public {
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);

        vm.expectEmit(true, true, true, true);
        emit ChallengeCreated(1, player1, address(0), BET_AMOUNT, FlipBattle.CoinSide.Heads);

        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );

        assertEq(gameId, 1);

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        assertEq(game.player1, player1);
        assertEq(game.player2, address(0));
        assertEq(game.betAmount, BET_AMOUNT);
        assertEq(uint8(game.player1Call), uint8(FlipBattle.CoinSide.Heads));
        assertEq(uint8(game.state), uint8(FlipBattle.GameState.Pending));

        vm.stopPrank();
    }

    function testCreateTargetedChallenge() public {
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);

        uint256 gameId = flipBattle.createChallenge(
            player2,
            BET_AMOUNT,
            FlipBattle.CoinSide.Tails
        );

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        assertEq(game.player2, player2);

        vm.stopPrank();
    }

    function testCannotCreateBelowMinBet() public {
        vm.startPrank(player1);
        uint256 tooLow = 0.4 ether;
        usdc.approve(address(flipBattle), tooLow);

        vm.expectRevert(FlipBattle.InvalidBetAmount.selector);
        flipBattle.createChallenge(address(0), tooLow, FlipBattle.CoinSide.Heads);

        vm.stopPrank();
    }

    function testCannotCreateAboveMaxBet() public {
        vm.startPrank(player1);
        uint256 tooHigh = 6 ether;
        usdc.approve(address(flipBattle), tooHigh);

        vm.expectRevert(FlipBattle.InvalidBetAmount.selector);
        flipBattle.createChallenge(address(0), tooHigh, FlipBattle.CoinSide.Heads);

        vm.stopPrank();
    }

    function testAcceptOpenChallenge() public {
        // Player1 creates challenge
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        // Player2 accepts
        vm.startPrank(player2);
        usdc.approve(address(flipBattle), BET_AMOUNT);

        vm.expectEmit(true, true, false, false);
        emit ChallengeAccepted(gameId, player2, 0);

        flipBattle.acceptChallenge(gameId);

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        assertEq(game.player2, player2);
        assertEq(uint8(game.state), uint8(FlipBattle.GameState.Active));
        assertTrue(game.vrfRequestId > 0);

        vm.stopPrank();
    }

    function testAcceptTargetedChallenge() public {
        // Player1 creates targeted challenge for player2
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            player2,
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        // Player2 accepts
        vm.startPrank(player2);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        flipBattle.acceptChallenge(gameId);

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        assertEq(game.player2, player2);
        assertEq(uint8(game.state), uint8(FlipBattle.GameState.Active));

        vm.stopPrank();
    }

    function testCannotAcceptTargetedChallengeAsWrongPlayer() public {
        // Player1 creates targeted challenge for player2
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            player2,
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        // Player3 tries to accept
        vm.startPrank(player3);
        usdc.approve(address(flipBattle), BET_AMOUNT);

        vm.expectRevert(FlipBattle.NotAuthorized.selector);
        flipBattle.acceptChallenge(gameId);

        vm.stopPrank();
    }

    function testGameCompletionPlayer1Wins() public {
        // Create and accept challenge
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        vm.startPrank(player2);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        flipBattle.acceptChallenge(gameId);
        vm.stopPrank();

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        uint256 requestId = game.vrfRequestId;

        // Record balances before
        uint256 player1BalanceBefore = usdc.balanceOf(player1);
        uint256 player2BalanceBefore = usdc.balanceOf(player2);

        // Fulfill VRF with Heads (0) - player1 wins
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0; // Heads

        vrfCoordinator.fulfillRandomWordsWithOverride(
            requestId,
            address(flipBattle),
            randomWords
        );

        // Check game completed
        game = flipBattle.getGame(gameId);
        assertEq(uint8(game.state), uint8(FlipBattle.GameState.Completed));
        assertEq(uint8(game.result), uint8(FlipBattle.CoinSide.Heads));

        // Check payout (95% of 2 USDC = 1.9 USDC)
        uint256 expectedPayout = (BET_AMOUNT * 2 * 9500) / 10000;
        assertEq(usdc.balanceOf(player1), player1BalanceBefore + expectedPayout);

        // Check stats
        FlipBattle.PlayerStats memory stats1 = flipBattle.getPlayerStats(player1);
        assertEq(stats1.wins, 1);
        assertEq(stats1.losses, 0);

        FlipBattle.PlayerStats memory stats2 = flipBattle.getPlayerStats(player2);
        assertEq(stats2.wins, 0);
        assertEq(stats2.losses, 1);
    }

    function testGameCompletionPlayer2Wins() public {
        // Create and accept challenge
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        vm.startPrank(player2);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        flipBattle.acceptChallenge(gameId);
        vm.stopPrank();

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        uint256 requestId = game.vrfRequestId;

        // Fulfill VRF with Tails (1) - player2 wins
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1; // Tails

        vrfCoordinator.fulfillRandomWordsWithOverride(
            requestId,
            address(flipBattle),
            randomWords
        );

        // Check game completed
        game = flipBattle.getGame(gameId);
        assertEq(uint8(game.result), uint8(FlipBattle.CoinSide.Tails));

        // Check stats
        FlipBattle.PlayerStats memory stats1 = flipBattle.getPlayerStats(player1);
        assertEq(stats1.wins, 0);
        assertEq(stats1.losses, 1);

        FlipBattle.PlayerStats memory stats2 = flipBattle.getPlayerStats(player2);
        assertEq(stats2.wins, 1);
        assertEq(stats2.losses, 0);
    }

    function testCancelExpiredChallenge() public {
        // Player1 creates challenge
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        uint256 balanceBefore = usdc.balanceOf(player1);

        // Fast forward 25 hours
        vm.warp(block.timestamp + 25 hours);

        // Cancel challenge
        vm.prank(player1);
        flipBattle.cancelChallenge(gameId);

        FlipBattle.Game memory game = flipBattle.getGame(gameId);
        assertEq(uint8(game.state), uint8(FlipBattle.GameState.Cancelled));

        // Check refund
        assertEq(usdc.balanceOf(player1), balanceBefore + BET_AMOUNT);
    }

    function testCannotCancelBeforeExpiry() public {
        // Player1 creates challenge
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );

        // Try to cancel immediately
        vm.expectRevert("Game not expired yet");
        flipBattle.cancelChallenge(gameId);

        vm.stopPrank();
    }

    function testWithdrawFees() public {
        // Create and complete a game to generate fees
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        uint256 gameId = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );
        vm.stopPrank();

        vm.startPrank(player2);
        usdc.approve(address(flipBattle), BET_AMOUNT);
        flipBattle.acceptChallenge(gameId);
        vm.stopPrank();

        FlipBattle.Game memory game = flipBattle.getGame(gameId);

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0;
        vrfCoordinator.fulfillRandomWordsWithOverride(
            game.vrfRequestId,
            address(flipBattle),
            randomWords
        );

        // Expected fee: 5% of 2 USDC = 0.1 USDC
        uint256 expectedFee = (BET_AMOUNT * 2 * 500) / 10000;
        assertEq(flipBattle.collectedFees(), expectedFee);

        // Withdraw fees
        uint256 ownerBalanceBefore = usdc.balanceOf(owner);
        vm.prank(owner);
        flipBattle.withdrawFees();

        assertEq(usdc.balanceOf(owner), ownerBalanceBefore + expectedFee);
        assertEq(flipBattle.collectedFees(), 0);
    }

    function testSetFeePercentage() public {
        vm.prank(owner);
        flipBattle.setFeePercentage(300); // 3%

        assertEq(flipBattle.feePercentage(), 300);
    }

    function testCannotSetFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(FlipBattle.InvalidFeePercentage.selector);
        flipBattle.setFeePercentage(1100); // 11% - too high
    }

    function testGetPlayerGames() public {
        vm.startPrank(player1);
        usdc.approve(address(flipBattle), BET_AMOUNT * 2);

        uint256 gameId1 = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Heads
        );

        uint256 gameId2 = flipBattle.createChallenge(
            address(0),
            BET_AMOUNT,
            FlipBattle.CoinSide.Tails
        );

        uint256[] memory games = flipBattle.getPlayerGames(player1);
        assertEq(games.length, 2);
        assertEq(games[0], gameId1);
        assertEq(games[1], gameId2);

        vm.stopPrank();
    }
}
