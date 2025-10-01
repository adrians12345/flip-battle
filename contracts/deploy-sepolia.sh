#!/bin/bash

# Flip Battle - Base Sepolia Deployment Script
# This script will guide you through deploying contracts to Base Sepolia

echo "🪙 Flip Battle - Base Sepolia Deployment"
echo "=========================================="
echo ""

# Check if foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Error: Foundry is not installed"
    echo "Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "✅ Foundry detected"
echo ""

# Prompt for environment variables
echo "📝 Please provide the following information:"
echo ""

read -sp "Private Key (WITHOUT 0x prefix): " PRIVATE_KEY
echo ""

read -p "VRF Subscription ID: " VRF_SUBSCRIPTION_ID
echo ""

read -p "BaseScan API Key: " BASESCAN_API_KEY
echo ""

# Validate inputs
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: Private key is required"
    exit 1
fi

if [ -z "$VRF_SUBSCRIPTION_ID" ] || [ "$VRF_SUBSCRIPTION_ID" == "0" ]; then
    echo "❌ Error: Valid VRF Subscription ID is required"
    echo "Create one at: https://vrf.chain.link (Base Sepolia network)"
    exit 1
fi

if [ -z "$BASESCAN_API_KEY" ]; then
    echo "⚠️  Warning: BaseScan API key not provided - contracts won't be verified"
    echo "Get one at: https://basescan.org/myapikey"
    read -p "Continue without verification? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🔍 Configuration Summary:"
echo "=========================="
echo "Private Key: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo "VRF Subscription ID: $VRF_SUBSCRIPTION_ID"
echo "BaseScan API Key: ${BASESCAN_API_KEY:0:10}..."
echo "RPC URL: https://sepolia.base.org"
echo ""

read -p "Deploy with these settings? (y/N): " DEPLOY
if [ "$DEPLOY" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Export variables for forge script
export PRIVATE_KEY
export VRF_SUBSCRIPTION_ID
export BASESCAN_API_KEY
export ETHERSCAN_API_KEY=$BASESCAN_API_KEY
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

# Run deployment
if [ -n "$BASESCAN_API_KEY" ]; then
    # Deploy with verification
    forge script script/Deploy.s.sol:Deploy \
        --rpc-url $BASE_SEPOLIA_RPC_URL \
        --broadcast \
        --verify \
        -vvvv
else
    # Deploy without verification
    forge script script/Deploy.s.sol:Deploy \
        --rpc-url $BASE_SEPOLIA_RPC_URL \
        --broadcast \
        -vvvv
fi

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Add VRF consumers to your subscription at https://vrf.chain.link"
    echo "   - Add FlipBattle contract address"
    echo "   - Add DailyFreeFlip contract address"
    echo ""
    echo "2. Update Vercel environment variables:"
    echo "   - Go to Vercel dashboard → Your Project → Settings → Environment Variables"
    echo "   - Add the deployed contract addresses from the output above"
    echo ""
    echo "3. Test the contracts on BaseScan:"
    echo "   https://sepolia.basescan.org"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above for details"
    exit 1
fi
