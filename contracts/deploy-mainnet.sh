#!/bin/bash

# Flip Battle - Base Mainnet Deployment Script
# ⚠️ WARNING: This deploys to MAINNET with REAL funds!

echo "🪙 Flip Battle - Base Mainnet Deployment"
echo "=========================================="
echo ""
echo "⚠️  WARNING: You are deploying to MAINNET!"
echo "⚠️  This will use REAL ETH and deploy to Base production network"
echo ""

# Check if foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Error: Foundry is not installed"
    echo "Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "✅ Foundry detected"
echo ""

# Pre-deployment checklist
echo "📋 Pre-Deployment Checklist:"
echo ""
echo "Have you completed the following?"
echo "  [ ] Testnet deployment successful and tested"
echo "  [ ] All bugs from testnet fixed"
echo "  [ ] Security audit completed (HIGHLY RECOMMENDED)"
echo "  [ ] Base Mainnet ETH in wallet (0.1+ ETH)"
echo "  [ ] VRF subscription created on Base Mainnet"
echo "  [ ] VRF subscription funded with 5+ LINK"
echo "  [ ] BaseScan API key obtained"
echo "  [ ] Initial USDC for reward pools (500-1000 USDC)"
echo "  [ ] Team reviewed and approved deployment"
echo "  [ ] Emergency pause mechanism tested"
echo "  [ ] Backup plan in place"
echo ""

read -p "Have you completed ALL items above? (yes/no): " CHECKLIST_DONE
if [ "$CHECKLIST_DONE" != "yes" ]; then
    echo ""
    echo "❌ Please complete the checklist before deploying to mainnet"
    echo "See MAINNET_PREPARATION.md for details"
    exit 1
fi

echo ""
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
    echo "Create one at: https://vrf.chain.link (Base Mainnet network)"
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
echo "Network: Base Mainnet (Chain ID: 8453)"
echo "RPC URL: https://mainnet.base.org"
echo "Private Key: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo "VRF Subscription ID: $VRF_SUBSCRIPTION_ID"
echo "BaseScan API Key: ${BASESCAN_API_KEY:0:10}..."
echo ""
echo "⚠️  FINAL WARNING: This will deploy to MAINNET with REAL funds!"
echo ""

read -p "Type 'DEPLOY TO MAINNET' to confirm: " FINAL_CONFIRM
if [ "$FINAL_CONFIRM" != "DEPLOY TO MAINNET" ]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting mainnet deployment..."
echo ""

# Export variables for forge script
export PRIVATE_KEY
export VRF_SUBSCRIPTION_ID
export BASESCAN_API_KEY
export ETHERSCAN_API_KEY=$BASESCAN_API_KEY
export BASE_MAINNET_RPC_URL="https://mainnet.base.org"

# Estimate gas costs
echo "💰 Estimating deployment costs..."
echo ""

# Run deployment
echo "🔄 Deploying contracts to Base Mainnet..."
echo ""

if [ -n "$BASESCAN_API_KEY" ]; then
    # Deploy with verification
    forge script script/Deploy.s.sol:Deploy \
        --rpc-url $BASE_MAINNET_RPC_URL \
        --broadcast \
        --verify \
        -vvvv
else
    # Deploy without verification
    forge script script/Deploy.s.sol:Deploy \
        --rpc-url $BASE_MAINNET_RPC_URL \
        --broadcast \
        -vvvv
fi

DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Mainnet deployment successful!"
    echo ""
    echo "🎉 CONGRATULATIONS! Flip Battle is now live on Base Mainnet!"
    echo ""
    echo "📋 CRITICAL Next Steps (DO NOT SKIP):"
    echo "======================================"
    echo ""
    echo "1. IMMEDIATELY add VRF consumers:"
    echo "   - Go to: https://vrf.chain.link"
    echo "   - Add FlipBattle contract address"
    echo "   - Add DailyFreeFlip contract address"
    echo ""
    echo "2. Fund reward pools:"
    echo "   - Transfer USDC to StreakManager for streak rewards"
    echo "   - Transfer USDC to ReferralSystem for referral bonuses"
    echo "   - Transfer USDC to DailyFreeFlip for initial prize pool"
    echo ""
    echo "3. Update Production Environment Variables:"
    echo "   - Go to Vercel dashboard"
    echo "   - Update NEXT_PUBLIC_NETWORK=mainnet"
    echo "   - Update all contract addresses"
    echo "   - Redeploy frontend"
    echo ""
    echo "4. Test on mainnet with small amounts:"
    echo "   - Create 1 USDC flip"
    echo "   - Test VRF fulfillment"
    echo "   - Verify all features work"
    echo ""
    echo "5. Monitor closely:"
    echo "   - Watch VRF fulfillments"
    echo "   - Monitor contract balances"
    echo "   - Track user transactions"
    echo "   - Be ready to pause if issues arise"
    echo ""
    echo "6. Launch gradually:"
    echo "   - Start with limited access/beta"
    echo "   - Monitor for 24-48 hours"
    echo "   - Fix any issues"
    echo "   - Full public launch"
    echo ""
    echo "🔗 Important Links:"
    echo "  BaseScan: https://basescan.org"
    echo "  VRF Dashboard: https://vrf.chain.link"
    echo "  Vercel: https://vercel.com/dashboard"
    echo ""
    echo "📞 Emergency Contacts:"
    echo "  - Have team on standby for first 48 hours"
    echo "  - Monitor Discord/support channels"
    echo "  - Be ready to pause contracts if needed"
    echo ""
else
    echo ""
    echo "❌ Mainnet deployment failed!"
    echo "Check the error messages above for details"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient ETH for gas"
    echo "  - Invalid VRF subscription ID"
    echo "  - Network connectivity issues"
    echo "  - Contract compilation errors"
    echo ""
    echo "DO NOT PANIC. Funds are safe. Review errors and try again."
    exit 1
fi
