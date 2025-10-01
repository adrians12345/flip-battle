// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {FlipBattle} from "../src/FlipBattle.sol";
import {StreakManager} from "../src/StreakManager.sol";
import {ReferralSystem} from "../src/ReferralSystem.sol";
import {DailyFreeFlip} from "../src/DailyFreeFlip.sol";

/**
 * @title DeployLocal
 * @notice Local deployment script for testing with Anvil
 * @dev Run with: forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast
 */
contract DeployLocal is Script {
    // Mock addresses for local testing
    address constant MOCK_VRF_COORDINATOR = address(0x1);
    bytes32 constant MOCK_KEY_HASH = bytes32(uint256(1));
    uint64 constant MOCK_SUBSCRIPTION_ID = 1;
    address constant MOCK_USDC = address(0x2);

    function run() public {
        console.log("=== Deploying to Local Anvil ===\n");

        vm.startBroadcast();

        // Deploy mock USDC first (for local testing)
        console.log("Note: Using mock addresses for local testing");
        console.log("VRF Coordinator:", MOCK_VRF_COORDINATOR);
        console.log("USDC:", MOCK_USDC);

        // Deploy contracts
        console.log("\n=== Deploying Contracts ===");

        FlipBattle flipBattle = new FlipBattle(
            MOCK_VRF_COORDINATOR,
            MOCK_KEY_HASH,
            MOCK_SUBSCRIPTION_ID,
            MOCK_USDC
        );
        console.log("1. FlipBattle deployed at:", address(flipBattle));

        StreakManager streakManager = new StreakManager(MOCK_USDC);
        console.log("2. StreakManager deployed at:", address(streakManager));

        ReferralSystem referralSystem = new ReferralSystem(MOCK_USDC);
        console.log("3. ReferralSystem deployed at:", address(referralSystem));

        DailyFreeFlip dailyFreeFlip = new DailyFreeFlip(
            MOCK_VRF_COORDINATOR,
            MOCK_KEY_HASH,
            MOCK_SUBSCRIPTION_ID,
            MOCK_USDC
        );
        console.log("4. DailyFreeFlip deployed at:", address(dailyFreeFlip));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("All contracts deployed successfully on local Anvil");
    }
}
