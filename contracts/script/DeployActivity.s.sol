// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ActivityGenerator.sol";

/**
 * @title DeployActivity
 * @notice Deployment script for ActivityGenerator contract
 */
contract DeployActivity is Script {
    function run() external {
        // Get deployer from environment or keystore
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        ActivityGenerator activityGen = new ActivityGenerator();

        console.log("ActivityGenerator deployed to:", address(activityGen));
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.stopBroadcast();
    }
}
