// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title FlipBattle
 * @notice A provably fair coin flip betting game on Base using Chainlink VRF
 * @dev Players create challenges and accept them, with outcomes determined by Chainlink VRF
 */
contract FlipBattle is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface public immutable i_vrfCoordinator;
    bytes32 public immutable i_keyHash;
    uint64 public immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint32 private constant NUM_WORDS = 1;

    // USDC Token
    IERC20 public immutable usdc;

    // Game State
    enum GameState { Pending, Active, Completed, Cancelled }
    enum CoinSide { Heads, Tails }

    struct Game {
        address player1;          // Challenge creator
        address player2;          // Challenge acceptor
        uint256 betAmount;        // Bet amount in USDC (6 decimals)
        CoinSide player1Call;     // Player1's call (Heads/Tails)
        CoinSide result;          // Actual flip result
        GameState state;          // Current game state
        uint256 createdAt;        // Timestamp of creation
        uint256 vrfRequestId;     // Chainlink VRF request ID
    }

    struct PlayerStats {
        uint256 wins;
        uint256 losses;
        int256 netProfit;         // Can be negative
    }

    // Storage
    mapping(uint256 => Game) public games;
    mapping(uint256 => uint256) public vrfRequestToGameId;  // VRF request => game ID
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerGames;

    uint256 public gameIdCounter;
    uint256 public feePercentage = 500;  // 5.00% (basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public collectedFees;
    uint256 public constant MIN_BET = 0.5 ether;  // 0.50 USDC (adjusted for 6 decimals)
    uint256 public constant MAX_BET = 5 ether;    // 5.00 USDC (adjusted for 6 decimals)
    uint256 public constant GAME_EXPIRY = 24 hours;

    // Events
    event ChallengeCreated(
        uint256 indexed gameId,
        address indexed player1,
        address indexed player2,
        uint256 betAmount,
        CoinSide player1Call
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
        CoinSide result,
        uint256 payout
    );

    event ChallengeCancelled(
        uint256 indexed gameId,
        address indexed player1
    );

    event FeesWithdrawn(
        address indexed owner,
        uint256 amount
    );

    // Errors
    error InvalidBetAmount();
    error InsufficientAllowance();
    error GameNotFound();
    error GameNotPending();
    error GameExpired();
    error NotAuthorized();
    error TransferFailed();
    error InvalidFeePercentage();

    /**
     * @notice Constructor
     * @param _vrfCoordinator Chainlink VRF Coordinator address
     * @param _keyHash Chainlink VRF key hash
     * @param _subscriptionId Chainlink VRF subscription ID
     * @param _usdc USDC token address
     */
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _usdc
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_keyHash = _keyHash;
        i_subscriptionId = _subscriptionId;
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Create a new challenge
     * @param opponent Address of opponent (address(0) for open challenge)
     * @param betAmount Amount to bet in USDC (6 decimals)
     * @param call Player1's call (Heads or Tails)
     */
    function createChallenge(
        address opponent,
        uint256 betAmount,
        CoinSide call
    ) external nonReentrant returns (uint256) {
        if (betAmount < MIN_BET || betAmount > MAX_BET) revert InvalidBetAmount();

        // Transfer USDC from player1 to contract
        if (usdc.allowance(msg.sender, address(this)) < betAmount) {
            revert InsufficientAllowance();
        }
        if (!usdc.transferFrom(msg.sender, address(this), betAmount)) {
            revert TransferFailed();
        }

        uint256 gameId = ++gameIdCounter;

        games[gameId] = Game({
            player1: msg.sender,
            player2: opponent,
            betAmount: betAmount,
            player1Call: call,
            result: CoinSide.Heads,  // Placeholder
            state: GameState.Pending,
            createdAt: block.timestamp,
            vrfRequestId: 0
        });

        playerGames[msg.sender].push(gameId);

        emit ChallengeCreated(gameId, msg.sender, opponent, betAmount, call);

        return gameId;
    }

    /**
     * @notice Accept a challenge
     * @param gameId ID of the game to accept
     */
    function acceptChallenge(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];

        if (game.player1 == address(0)) revert GameNotFound();
        if (game.state != GameState.Pending) revert GameNotPending();
        if (block.timestamp > game.createdAt + GAME_EXPIRY) revert GameExpired();
        if (game.player2 != address(0) && game.player2 != msg.sender) {
            revert NotAuthorized();
        }

        // Transfer USDC from player2 to contract
        if (usdc.allowance(msg.sender, address(this)) < game.betAmount) {
            revert InsufficientAllowance();
        }
        if (!usdc.transferFrom(msg.sender, address(this), game.betAmount)) {
            revert TransferFailed();
        }

        // Update game state
        game.player2 = msg.sender;
        game.state = GameState.Active;
        playerGames[msg.sender].push(gameId);

        // Request randomness from Chainlink VRF
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        game.vrfRequestId = requestId;
        vrfRequestToGameId[requestId] = gameId;

        emit ChallengeAccepted(gameId, msg.sender, requestId);
    }

    /**
     * @notice Callback function used by VRF Coordinator
     * @param requestId VRF request ID
     * @param randomWords Array of random values
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 gameId = vrfRequestToGameId[requestId];
        Game storage game = games[gameId];

        if (game.state != GameState.Active) return;

        // Determine coin flip result (0 = Heads, 1 = Tails)
        game.result = CoinSide(randomWords[0] % 2);
        game.state = GameState.Completed;

        // Determine winner
        address winner;
        address loser;

        if (game.result == game.player1Call) {
            winner = game.player1;
            loser = game.player2;
        } else {
            winner = game.player2;
            loser = game.player1;
        }

        // Calculate payout (95% to winner, 5% fee)
        uint256 totalPot = game.betAmount * 2;
        uint256 fee = (totalPot * feePercentage) / BASIS_POINTS;
        uint256 payout = totalPot - fee;

        // Update stats
        playerStats[winner].wins++;
        playerStats[winner].netProfit += int256(payout - game.betAmount);
        playerStats[loser].losses++;
        playerStats[loser].netProfit -= int256(game.betAmount);

        collectedFees += fee;

        // Transfer payout to winner
        require(usdc.transfer(winner, payout), "Transfer failed");

        emit GameCompleted(gameId, winner, loser, game.result, payout);
    }

    /**
     * @notice Cancel an expired or pending challenge
     * @param gameId ID of the game to cancel
     */
    function cancelChallenge(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];

        if (game.player1 == address(0)) revert GameNotFound();
        if (game.player1 != msg.sender) revert NotAuthorized();
        if (game.state != GameState.Pending) revert GameNotPending();
        if (block.timestamp <= game.createdAt + GAME_EXPIRY) {
            revert("Game not expired yet");
        }

        game.state = GameState.Cancelled;

        // Refund player1
        require(usdc.transfer(game.player1, game.betAmount), "Transfer failed");

        emit ChallengeCancelled(gameId, game.player1);
    }

    /**
     * @notice Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;

        require(usdc.transfer(owner(), amount), "Transfer failed");

        emit FeesWithdrawn(owner(), amount);
    }

    /**
     * @notice Update fee percentage (owner only)
     * @param newFeePercentage New fee in basis points (e.g., 500 = 5%)
     */
    function setFeePercentage(uint256 newFeePercentage) external onlyOwner {
        if (newFeePercentage > 1000) revert InvalidFeePercentage();  // Max 10%
        feePercentage = newFeePercentage;
    }

    /**
     * @notice Get player's game history
     * @param player Address of the player
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    /**
     * @notice Get game details
     * @param gameId ID of the game
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    /**
     * @notice Get player stats
     * @param player Address of the player
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
}
