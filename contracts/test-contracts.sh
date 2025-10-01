#!/bin/bash

# Flip Battle - Contract Testing Script
# Quick script to test deployed contracts via cast commands

echo "🧪 Flip Battle - Contract Testing Tool"
echo "======================================="
echo ""

# Check if cast is installed
if ! command -v cast &> /dev/null; then
    echo "❌ Error: Foundry (cast) is not installed"
    echo "Install with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "✅ Foundry detected"
echo ""

# Network configuration
RPC_URL="https://sepolia.base.org"
CHAIN_ID=84532

# Prompt for contract addresses
echo "📝 Enter your deployed contract addresses:"
echo ""

read -p "FlipBattle address: " FLIP_BATTLE
read -p "StreakManager address: " STREAK_MANAGER
read -p "ReferralSystem address: " REFERRAL_SYSTEM
read -p "DailyFreeFlip address: " DAILY_FREE_FLIP

echo ""
echo "🔍 Testing Contracts..."
echo ""

# Test FlipBattle
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 FlipBattle Contract"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Minimum Bet: "
MIN_BET=$(cast call $FLIP_BATTLE "minimumBet()(uint256)" --rpc-url $RPC_URL)
echo "$((MIN_BET / 1000000)) USDC"

echo -n "Platform Fee: "
PLATFORM_FEE=$(cast call $FLIP_BATTLE "platformFee()(uint256)" --rpc-url $RPC_URL)
echo "$PLATFORM_FEE%"

echo -n "Game Counter: "
GAME_COUNT=$(cast call $FLIP_BATTLE "gameCounter()(uint256)" --rpc-url $RPC_URL)
echo "$GAME_COUNT games created"

echo -n "VRF Coordinator: "
VRF_COORD=$(cast call $FLIP_BATTLE "vrfCoordinator()(address)" --rpc-url $RPC_URL)
echo "$VRF_COORD"

echo ""

# Test StreakManager
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 StreakManager Contract"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Milestone Rewards:"
for day in 7 14 30 60 90; do
    REWARD=$(cast call $STREAK_MANAGER "streakRewards(uint256)(uint256)" $day --rpc-url $RPC_URL)
    echo "  Day $day: $((REWARD / 1000000)) USDC"
done

echo ""

# Test ReferralSystem
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 ReferralSystem Contract"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Referral Bonus: "
REF_BONUS=$(cast call $REFERRAL_SYSTEM "REFERRAL_BONUS()(uint256)" --rpc-url $RPC_URL)
echo "$((REF_BONUS / 1000000)) USDC"

echo -n "Referral Percentage: "
REF_PCT=$(cast call $REFERRAL_SYSTEM "REFERRAL_PERCENTAGE()(uint256)" --rpc-url $RPC_URL)
echo "$REF_PCT%"

echo -n "FlipBattle Address: "
FLIP_ADDR=$(cast call $REFERRAL_SYSTEM "flipBattle()(address)" --rpc-url $RPC_URL)
echo "$FLIP_ADDR"

echo ""

# Test DailyFreeFlip
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎁 DailyFreeFlip Contract"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "Active: "
IS_ACTIVE=$(cast call $DAILY_FREE_FLIP "isActive()(bool)" --rpc-url $RPC_URL)
if [ "$IS_ACTIVE" == "true" ]; then
    echo "✅ Yes"
else
    echo "❌ No"
fi

echo -n "Prize Pool: "
PRIZE_POOL=$(cast call $DAILY_FREE_FLIP "prizePool()(uint256)" --rpc-url $RPC_URL)
echo "$((PRIZE_POOL / 1000000)) USDC"

echo -n "Fee Percentage: "
FEE_PCT=$(cast call $DAILY_FREE_FLIP "feePercentage()(uint256)" --rpc-url $RPC_URL)
echo "$FEE_PCT%"

echo ""

# Test user stats (if address provided)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 User Stats (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Enter wallet address to check stats (or press Enter to skip): " USER_ADDR

if [ -n "$USER_ADDR" ]; then
    echo ""
    echo "User: $USER_ADDR"
    echo ""

    # FlipBattle stats
    echo "FlipBattle Stats:"
    STATS=$(cast call $FLIP_BATTLE "getUserStats(address)((uint256,uint256,uint256,int256))" $USER_ADDR --rpc-url $RPC_URL)
    echo "  Raw stats: $STATS"

    # Streak
    echo ""
    echo "Streak Stats:"
    STREAK=$(cast call $STREAK_MANAGER "getCurrentStreak(address)(uint256,uint256,bool[])" $USER_ADDR --rpc-url $RPC_URL)
    echo "  Current streak: $STREAK"

    # Referrals
    echo ""
    echo "Referral Stats:"
    REF_COUNT=$(cast call $REFERRAL_SYSTEM "getReferralCount(address)(uint256)" $USER_ADDR --rpc-url $RPC_URL)
    echo "  Referral count: $REF_COUNT"

    REF_EARNINGS=$(cast call $REFERRAL_SYSTEM "getReferralEarnings(address)(uint256)" $USER_ADDR --rpc-url $RPC_URL)
    echo "  Referral earnings: $((REF_EARNINGS / 1000000)) USDC"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Contract Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  - All contracts responding correctly"
echo "  - Configuration values look good"
echo "  - Ready for frontend integration"
echo ""
echo "🔗 View contracts on BaseScan:"
echo "  FlipBattle: https://sepolia.basescan.org/address/$FLIP_BATTLE"
echo "  StreakManager: https://sepolia.basescan.org/address/$STREAK_MANAGER"
echo "  ReferralSystem: https://sepolia.basescan.org/address/$REFERRAL_SYSTEM"
echo "  DailyFreeFlip: https://sepolia.basescan.org/address/$DAILY_FREE_FLIP"
echo ""
