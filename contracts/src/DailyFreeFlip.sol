// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title DailyFreeFlip
 * @notice Daily free lottery where one lucky participant wins the prize pool
 * @dev Users can enter once per 24 hours (gas only), winner selected via Chainlink VRF
 */
contract DailyFreeFlip is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface public immutable i_vrfCoordinator;
    bytes32 public immutable i_keyHash;
    uint64 public immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant CALLBACK_GAS_LIMIT = 100000;
    uint32 private constant NUM_WORDS = 1;

    IERC20 public immutable usdc;

    struct Round {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 prizePool;
        address[] participants;
        address winner;
        uint256 vrfRequestId;
        bool completed;
    }

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => bool)) public hasEntered;  // roundId => user => entered
    mapping(uint256 => uint256) public vrfRequestToRound;  // VRF request => round ID

    uint256 public currentRoundId;
    uint256 public constant ROUND_DURATION = 24 hours;
    uint256 public constant ONE_DAY = 24 hours;
    uint256 public prizePoolPercentage = 1000;  // 10% of flip fees goes to daily prize
    uint256 public constant BASIS_POINTS = 10000;

    // Events
    event RoundStarted(
        uint256 indexed roundId,
        uint256 startTime,
        uint256 endTime
    );

    event UserEntered(
        uint256 indexed roundId,
        address indexed user
    );

    event WinnerSelected(
        uint256 indexed roundId,
        address indexed winner,
        uint256 prizeAmount
    );

    event PrizePoolFunded(
        uint256 indexed roundId,
        uint256 amount
    );

    // Errors
    error RoundNotActive();
    error AlreadyEntered();
    error NoParticipants();
    error RoundNotEnded();
    error TransferFailed();

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

        // Start first round
        _startNewRound();
    }

    /**
     * @notice Enter the current daily free flip (gas only)
     */
    function enterDailyFlip() external {
        Round storage round = rounds[currentRoundId];

        if (block.timestamp > round.endTime) revert RoundNotActive();
        if (hasEntered[currentRoundId][msg.sender]) revert AlreadyEntered();

        hasEntered[currentRoundId][msg.sender] = true;
        round.participants.push(msg.sender);

        emit UserEntered(currentRoundId, msg.sender);
    }

    /**
     * @notice End current round and select winner
     */
    function endRound() external {
        Round storage round = rounds[currentRoundId];

        if (block.timestamp <= round.endTime) revert RoundNotEnded();
        if (round.participants.length == 0) revert NoParticipants();
        if (round.completed) revert RoundNotActive();

        // Request randomness from Chainlink VRF
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        round.vrfRequestId = requestId;
        vrfRequestToRound[requestId] = currentRoundId;
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
        uint256 roundId = vrfRequestToRound[requestId];
        Round storage round = rounds[roundId];

        if (round.completed) return;

        // Select winner randomly
        uint256 winnerIndex = randomWords[0] % round.participants.length;
        address winner = round.participants[winnerIndex];

        round.winner = winner;
        round.completed = true;

        // Transfer prize to winner
        if (round.prizePool > 0) {
            require(usdc.transfer(winner, round.prizePool), "Transfer failed");
        }

        emit WinnerSelected(roundId, winner, round.prizePool);

        // Start new round
        _startNewRound();
    }

    /**
     * @notice Start a new round
     */
    function _startNewRound() internal {
        currentRoundId++;

        rounds[currentRoundId] = Round({
            roundId: currentRoundId,
            startTime: block.timestamp,
            endTime: block.timestamp + ROUND_DURATION,
            prizePool: 0,
            participants: new address[](0),
            winner: address(0),
            vrfRequestId: 0,
            completed: false
        });

        emit RoundStarted(currentRoundId, block.timestamp, block.timestamp + ROUND_DURATION);
    }

    /**
     * @notice Add funds to current prize pool (called by FlipBattle contract)
     * @param amount Amount to add
     */
    function addToPrizePool(uint256 amount) external {
        Round storage round = rounds[currentRoundId];
        round.prizePool += amount;

        emit PrizePoolFunded(currentRoundId, amount);
    }

    /**
     * @notice Fund prize pool directly (owner or anyone)
     * @param amount Amount of USDC to fund
     */
    function fundPrizePool(uint256 amount) external {
        if (!usdc.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        rounds[currentRoundId].prizePool += amount;

        emit PrizePoolFunded(currentRoundId, amount);
    }

    /**
     * @notice Get current round info
     */
    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    /**
     * @notice Get round participants
     * @param roundId ID of the round
     */
    function getRoundParticipants(uint256 roundId) external view returns (address[] memory) {
        return rounds[roundId].participants;
    }

    /**
     * @notice Check if user has entered current round
     * @param user Address of the user
     */
    function hasEnteredCurrentRound(address user) external view returns (bool) {
        return hasEntered[currentRoundId][user];
    }

    /**
     * @notice Get time remaining in current round
     */
    function getTimeRemaining() external view returns (uint256) {
        Round storage round = rounds[currentRoundId];
        if (block.timestamp >= round.endTime) return 0;
        return round.endTime - block.timestamp;
    }

    /**
     * @notice Get recent winners (last N rounds)
     * @param count Number of recent winners to fetch
     */
    function getRecentWinners(uint256 count) external view returns (
        address[] memory winners,
        uint256[] memory prizes
    ) {
        uint256 totalRounds = currentRoundId;
        uint256 actualCount = count > totalRounds ? totalRounds : count;

        winners = new address[](actualCount);
        prizes = new uint256[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            uint256 roundId = totalRounds - i;
            if (roundId == 0) break;

            Round storage round = rounds[roundId];
            if (round.completed) {
                winners[i] = round.winner;
                prizes[i] = round.prizePool;
            }
        }

        return (winners, prizes);
    }
}
