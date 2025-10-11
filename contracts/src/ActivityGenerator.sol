// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ActivityGenerator
 * @notice Gas-optimized contract to generate onchain activity for Builder Score
 * @dev Designed to be lightweight and generate consistent transactions
 * @dev Gas optimizations: unchecked math, single event, cached storage reads
 */
contract ActivityGenerator {
    // Events for activity tracking (using indexed params for cheaper filtering)
    event ActivityRecorded(address indexed user, uint256 timestamp, bytes32 activityType);

    // Storage (packed for gas efficiency)
    mapping(address => uint256) public activityCount;
    mapping(address => uint256) public lastActivity;
    mapping(address => string) public lastMessage;
    uint256 public totalActivities;

    // Owner (immutable for gas savings)
    address public immutable owner;

    // Activity type constants (bytes32 for gas efficiency)
    bytes32 private constant DEPLOYED = keccak256("DEPLOYED");
    bytes32 private constant RECORDED = keccak256("RECORDED");
    bytes32 private constant MESSAGE = keccak256("MESSAGE");
    bytes32 private constant BATCH = keccak256("BATCH");
    bytes32 private constant PING = keccak256("PING");

    constructor() {
        owner = msg.sender;
        emit ActivityRecorded(msg.sender, block.timestamp, DEPLOYED);
    }

    /**
     * @notice Record simple activity (MOST GAS EFFICIENT)
     * @dev Optimized: unchecked math, single SSTORE per mapping, single event
     */
    function recordActivity() external {
        unchecked {
            activityCount[msg.sender]++;
            totalActivities++;
        }
        lastActivity[msg.sender] = block.timestamp;

        emit ActivityRecorded(msg.sender, block.timestamp, RECORDED);
    }

    /**
     * @notice Store a message onchain (more expensive, use sparingly)
     * @param message The message to store
     */
    function storeMessage(string calldata message) external {
        require(bytes(message).length > 0, "Empty");
        require(bytes(message).length <= 280, "Too long");

        lastMessage[msg.sender] = message;
        unchecked {
            activityCount[msg.sender]++;
            totalActivities++;
        }
        lastActivity[msg.sender] = block.timestamp;

        emit ActivityRecorded(msg.sender, block.timestamp, MESSAGE);
    }

    /**
     * @notice Batch record multiple activities (gas efficient for multiple)
     * @param count Number of activities to record
     */
    function batchRecordActivity(uint256 count) external {
        require(count > 0 && count <= 10, "Invalid count");

        // Cache storage read
        uint256 _totalActivities = totalActivities;
        uint256 _activityCount = activityCount[msg.sender];

        unchecked {
            _activityCount += count;
            _totalActivities += count;
        }

        // Single write to each storage slot
        activityCount[msg.sender] = _activityCount;
        totalActivities = _totalActivities;
        lastActivity[msg.sender] = block.timestamp;

        emit ActivityRecorded(msg.sender, block.timestamp, BATCH);
    }

    /**
     * @notice Get activity stats for a user
     * @param user The user address
     * @return count Total activity count
     * @return timestamp Last activity timestamp
     */
    function getActivityStats(address user) external view returns (uint256 count, uint256 timestamp) {
        return (activityCount[user], lastActivity[user]);
    }

    /**
     * @notice Get contract-wide stats
     * @return total Total activities recorded
     */
    function getTotalActivities() external view returns (uint256 total) {
        return totalActivities;
    }

    /**
     * @notice Simple ping (minimal gas)
     * @dev Useful for generating predictable gas consumption
     */
    function pingContract() external {
        unchecked {
            activityCount[msg.sender]++;
            totalActivities++;
        }
        lastActivity[msg.sender] = block.timestamp;

        emit ActivityRecorded(msg.sender, block.timestamp, PING);
    }

    /**
     * @notice Get user stats (view function, no gas)
     * @param user The user address
     * @return count Total activities
     * @return timestamp Last activity timestamp
     */
    function getUserStats(address user) external view returns (uint256 count, uint256 timestamp) {
        return (activityCount[user], lastActivity[user]);
    }
}
