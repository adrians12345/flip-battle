#!/bin/bash

###############################################################################
# ActivityGenerator Deployment Script for Base Mainnet
# Date: October 11, 2025
#
# This script deploys the ActivityGenerator contract to Base mainnet and
# automatically verifies it on Basescan.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ActivityGenerator Base Mainnet Deployment Script            ║${NC}"
echo -e "${GREEN}║   October 2025 - Base Chain ID: 8453                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with the following variables:"
    echo "  PRIVATE_KEY=your_private_key"
    echo "  BASESCAN_API_KEY=your_basescan_api_key"
    exit 1
fi

# Load environment variables
source .env

# Verify required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env file${NC}"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${YELLOW}Warning: BASESCAN_API_KEY not set. Contract will not be verified.${NC}"
fi

# Network configuration
NETWORK="base"
RPC_URL="https://mainnet.base.org"
CHAIN_ID="8453"

echo -e "${YELLOW}Network Configuration:${NC}"
echo "  Network: $NETWORK"
echo "  RPC URL: $RPC_URL"
echo "  Chain ID: $CHAIN_ID"
echo ""

# Check balance
echo -e "${YELLOW}Checking deployer balance...${NC}"
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $RPC_URL)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)

echo "  Deployer Address: $DEPLOYER_ADDRESS"
echo "  Balance: $BALANCE_ETH ETH"
echo ""

# Warn if balance is low
if (( $(echo "$BALANCE_ETH < 0.001" | bc -l) )); then
    echo -e "${RED}Warning: Balance is very low. Deployment may fail.${NC}"
    echo "Please fund your address with at least 0.001 ETH on Base mainnet."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Confirm deployment
echo -e "${YELLOW}Ready to deploy ActivityGenerator to Base mainnet.${NC}"
echo ""
read -p "Proceed with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Deploying ActivityGenerator...${NC}"
echo ""

# Deploy contract
forge script script/DeployActivity.s.sol:DeployActivity \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Check the deployment output above for your contract address."
echo ""
echo "To manually verify the contract later, use:"
echo -e "${YELLOW}forge verify-contract <CONTRACT_ADDRESS> \\${NC}"
echo -e "${YELLOW}  src/ActivityGenerator.sol:ActivityGenerator \\${NC}"
echo -e "${YELLOW}  --chain $CHAIN_ID \\${NC}"
echo -e "${YELLOW}  --etherscan-api-key \$BASESCAN_API_KEY \\${NC}"
echo -e "${YELLOW}  --watch${NC}"
echo ""
echo "View your contract on Basescan:"
echo "https://basescan.org/address/<CONTRACT_ADDRESS>"
echo ""
