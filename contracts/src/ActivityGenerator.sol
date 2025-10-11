// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ActivityGenerator
 * @notice Simple contract to generate onchain activity for Builder Score
 * @dev Designed to be lightweight and generate consistent transactions
 */
contract ActivityGenerator {
    // Events for activity tracking
    event ActivityRecorded(address indexed user, uint256 timestamp, string activityType);
    event MessageStored(address indexed user, string message, uint256 timestamp);
    event CounterIncremented(address indexed user, uint256 newCount);

    // Storage
    mapping(address => uint256) public activityCount;
    mapping(address => uint256) public lastActivity;
    mapping(address => string) public lastMessage;
    uint256 public totalActivities;

    // Owner
    address public owner;

    constructor() {
        owner = msg.sender;
        emit ActivityRecorded(msg.sender, block.timestamp, "CONTRACT_DEPLOYED");
    }

    /**
     * @notice Record simple activity
     * @dev Free function that just increments counters and emits events
     */
    function recordActivity() external {
        activityCount[msg.sender]++;
        lastActivity[msg.sender] = block.timestamp;
        totalActivities++;

        emit ActivityRecorded(msg.sender, block.timestamp, "ACTIVITY_RECORDED");
        emit CounterIncremented(msg.sender, activityCount[msg.sender]);
    }

    /**
     * @notice Store a message onchain
     * @param message The message to store
     */
    function storeMessage(string calldata message) external {
        require(bytes(message).length > 0, "Message cannot be empty");
        require(bytes(message).length <= 280, "Message too long");

        lastMessage[msg.sender] = message;
        activityCount[msg.sender]++;
        lastActivity[msg.sender] = block.timestamp;
        totalActivities++;

        emit MessageStored(msg.sender, message, block.timestamp);
        emit ActivityRecorded(msg.sender, block.timestamp, "MESSAGE_STORED");
    }

    /**
     * @notice Batch record multiple activities in one transaction
     * @param count Number of activities to record
     */
    function batchRecordActivity(uint256 count) external {
        require(count > 0 && count <= 10, "Count must be between 1 and 10");

        for (uint256 i = 0; i < count; i++) {
            activityCount[msg.sender]++;
            totalActivities++;
            emit ActivityRecorded(msg.sender, block.timestamp, "BATCH_ACTIVITY");
        }

        lastActivity[msg.sender] = block.timestamp;
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
     * @notice Simple interaction that costs gas but does nothing
     * @dev Useful for generating predictable gas consumption
     */
    function pingContract() external {
        activityCount[msg.sender]++;
        lastActivity[msg.sender] = block.timestamp;
        totalActivities++;

        emit ActivityRecorded(msg.sender, block.timestamp, "PING");
    }
}
