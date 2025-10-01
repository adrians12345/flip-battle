// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {FlipBattle} from "../src/FlipBattle.sol";
import {StreakManager} from "../src/StreakManager.sol";
import {ReferralSystem} from "../src/ReferralSystem.sol";
import {DailyFreeFlip} from "../src/DailyFreeFlip.sol";

/**
 * @title Deploy
 * @notice Deployment script for all Flip Battle contracts
 * @dev Deploy to Base Sepolia: forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify
 *      Deploy to Base Mainnet: forge script script/Deploy.s.sol --rpc-url base-mainnet --broadcast --verify
 */
contract Deploy is Script {
    // Base Sepolia Configuration
    address constant BASE_SEPOLIA_VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    bytes32 constant BASE_SEPOLIA_KEY_HASH = 0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887;
    address constant BASE_SEPOLIA_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // Base Mainnet Configuration
    address constant BASE_MAINNET_VRF_COORDINATOR = 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634;
    bytes32 constant BASE_MAINNET_KEY_HASH = 0x9e9e46732b32662b9adc6f3abdf6c5b1676a4206dbbde3e23db96cd04743963c;
    address constant BASE_MAINNET_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    // VRF Subscription ID (must be created manually and funded)
    // You'll need to update this after creating your VRF subscription
    uint64 public vrfSubscriptionId;

    // Deployed contract addresses
    FlipBattle public flipBattle;
    StreakManager public streakManager;
    ReferralSystem public referralSystem;
    DailyFreeFlip public dailyFreeFlip;

    function run() public {
        // Determine network
        uint256 chainId = block.chainid;
        bool isBaseSepolia = chainId == 84532;
        bool isBaseMainnet = chainId == 8453;

        require(
            isBaseSepolia || isBaseMainnet,
            "Unsupported network. Use Base Sepolia (84532) or Base Mainnet (8453)"
        );

        // Get VRF parameters based on network
        address vrfCoordinator;
        bytes32 keyHash;
        address usdc;

        if (isBaseSepolia) {
            vrfCoordinator = BASE_SEPOLIA_VRF_COORDINATOR;
            keyHash = BASE_SEPOLIA_KEY_HASH;
            usdc = BASE_SEPOLIA_USDC;
            console.log("Deploying to Base Sepolia...");
        } else {
            vrfCoordinator = BASE_MAINNET_VRF_COORDINATOR;
            keyHash = BASE_MAINNET_KEY_HASH;
            usdc = BASE_MAINNET_USDC;
            console.log("Deploying to Base Mainnet...");
        }

        // Read VRF subscription ID from environment
        vrfSubscriptionId = uint64(vm.envUint("VRF_SUBSCRIPTION_ID"));
        require(vrfSubscriptionId > 0, "VRF_SUBSCRIPTION_ID not set");

        console.log("VRF Coordinator:", vrfCoordinator);
        console.log("Key Hash:", vm.toString(keyHash));
        console.log("USDC Address:", usdc);
        console.log("VRF Subscription ID:", vrfSubscriptionId);

        // Start broadcasting transactions
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        console.log("\n=== Deploying Contracts ===");

        // 1. Deploy FlipBattle
        console.log("\n1. Deploying FlipBattle...");
        flipBattle = new FlipBattle(
            vrfCoordinator,
            keyHash,
            vrfSubscriptionId,
            usdc
        );
        console.log("FlipBattle deployed at:", address(flipBattle));

        // 2. Deploy StreakManager
        console.log("\n2. Deploying StreakManager...");
        streakManager = new StreakManager(usdc);
        console.log("StreakManager deployed at:", address(streakManager));

        // 3. Deploy ReferralSystem
        console.log("\n3. Deploying ReferralSystem...");
        referralSystem = new ReferralSystem(usdc);
        console.log("ReferralSystem deployed at:", address(referralSystem));

        // 4. Deploy DailyFreeFlip
        console.log("\n4. Deploying DailyFreeFlip...");
        dailyFreeFlip = new DailyFreeFlip(
            vrfCoordinator,
            keyHash,
            vrfSubscriptionId,
            usdc
        );
        console.log("DailyFreeFlip deployed at:", address(dailyFreeFlip));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network:", isBaseSepolia ? "Base Sepolia" : "Base Mainnet");
        console.log("Chain ID:", chainId);
        console.log("\nDeployed Contracts:");
        console.log("- FlipBattle:      ", address(flipBattle));
        console.log("- StreakManager:   ", address(streakManager));
        console.log("- ReferralSystem:  ", address(referralSystem));
        console.log("- DailyFreeFlip:   ", address(dailyFreeFlip));

        console.log("\n=== Post-Deployment Steps ===");
        console.log("1. Add FlipBattle and DailyFreeFlip as VRF consumers:");
        console.log("   - Go to https://vrf.chain.link");
        console.log("   - Add consumer:", address(flipBattle));
        console.log("   - Add consumer:", address(dailyFreeFlip));
        console.log("\n2. Fund contracts with USDC for rewards:");
        console.log("   - Fund StreakManager for streak rewards");
        console.log("   - Fund ReferralSystem for referral bonuses");
        console.log("   - Fund DailyFreeFlip for daily prizes");
        console.log("\n3. Update frontend .env with contract addresses");
        console.log("\n4. Verify contracts on Basescan (if not auto-verified):");
        console.log("   forge verify-contract <ADDRESS> <CONTRACT> --chain-id", chainId);
    }
}
