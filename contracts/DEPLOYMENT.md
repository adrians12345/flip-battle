# Flip Battle - Deployment Guide

This guide covers deploying the Flip Battle smart contracts to Base Sepolia (testnet) and Base Mainnet.

## Prerequisites

1. **Foundry installed** - Verify with `forge --version`
2. **Private key** - Export or add to `.env` file
3. **Base network ETH** - For gas fees
4. **Basescan API key** - For contract verification (optional)

## Network Information

### Base Sepolia (Testnet)
- Chain ID: `84532`
- RPC: `https://sepolia.base.org`
- Block Explorer: `https://sepolia.basescan.org`
- VRF Coordinator: `0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Circle USDC)
- Faucets:
  - ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
  - USDC: https://faucet.circle.com

### Base Mainnet
- Chain ID: `8453`
- RPC: `https://mainnet.base.org`
- Block Explorer: `https://basescan.org`
- VRF Coordinator: `0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634`
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (Circle USDC)

## Step 1: Setup Environment

1. **Copy the example environment file:**
```bash
cd contracts
cp .env.example .env
```

2. **Edit `.env` and fill in your values:**
```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
VRF_SUBSCRIPTION_ID=0  # Will update after Step 2
BASESCAN_API_KEY=your_basescan_api_key
```

## Step 2: Create Chainlink VRF Subscription

Before deploying, you need a VRF subscription:

### For Base Sepolia:
1. Go to https://vrf.chain.link
2. Connect wallet to **Base Sepolia** network
3. Click "Create Subscription"
4. Note your Subscription ID
5. Fund with testnet LINK (minimum 10 LINK)
   - Get testnet LINK from: https://faucets.chain.link

### For Base Mainnet:
1. Go to https://vrf.chain.link
2. Connect wallet to **Base Mainnet** network
3. Click "Create Subscription"
4. Note your Subscription ID
5. Fund with LINK (recommended 50+ LINK)

**Update `.env` with your subscription ID:**
```bash
VRF_SUBSCRIPTION_ID=123  # Replace with your actual ID
```

## Step 3: Deploy to Base Sepolia (Testnet)

### Build contracts:
```bash
forge build
```

### Deploy:
```bash
forge script script/Deploy.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  -vvvv
```

### Alternative (without verification):
```bash
forge script script/Deploy.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  -vvvv
```

### Save the deployed addresses from console output!

Example output:
```
FlipBattle deployed at: 0x1234...
StreakManager deployed at: 0x5678...
ReferralSystem deployed at: 0x9ABC...
DailyFreeFlip deployed at: 0xDEF0...
```

## Step 4: Add VRF Consumers

After deployment, add the VRF-dependent contracts as consumers:

1. Go to https://vrf.chain.link
2. Select your subscription
3. Click "Add Consumer"
4. Add both addresses:
   - `FlipBattle` contract address
   - `DailyFreeFlip` contract address

## Step 5: Fund Reward Contracts

The reward contracts need USDC funding:

### StreakManager (Streak Rewards)
```bash
# Estimate: $1000 USDC for 30 users × Day 30 rewards
# Transfer USDC to StreakManager address
```

### ReferralSystem (Referral Bonuses)
```bash
# Estimate: $500 USDC for initial referral bonuses
# Transfer USDC to ReferralSystem address
```

### DailyFreeFlip (Daily Prizes)
```bash
# Estimate: $100 USDC for 10 days of prizes
# Transfer USDC to DailyFreeFlip address
```

## Step 6: Verify Contracts (if not auto-verified)

If verification failed during deployment:

```bash
# FlipBattle
forge verify-contract <FLIPBATTLE_ADDRESS> \
  FlipBattle \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(address,bytes32,uint64,address)" <VRF_COORDINATOR> <KEY_HASH> <SUBSCRIPTION_ID> <USDC>)

# StreakManager
forge verify-contract <STREAKMANAGER_ADDRESS> \
  StreakManager \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(address)" <USDC>)

# ReferralSystem
forge verify-contract <REFERRALSYSTEM_ADDRESS> \
  ReferralSystem \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(address)" <USDC>)

# DailyFreeFlip
forge verify-contract <DAILYFREEFLIP_ADDRESS> \
  DailyFreeFlip \
  --chain-id 84532 \
  --constructor-args $(cast abi-encode "constructor(address,bytes32,uint64,address)" <VRF_COORDINATOR> <KEY_HASH> <SUBSCRIPTION_ID> <USDC>)
```

## Step 7: Test on Testnet

Before mainnet deployment, thoroughly test all functions:

### Test FlipBattle:
1. Approve USDC: `approve(FlipBattle, amount)`
2. Create challenge: `createChallenge(opponent, betAmount, coinSide)`
3. Accept challenge (from different wallet): `acceptChallenge(gameId)`
4. Wait for VRF callback (should complete automatically)
5. Verify winner received payout

### Test StreakManager:
1. Check in: `checkIn()`
2. Wait 24 hours (or advance time on testnet)
3. Check in again: `checkIn()`
4. Claim reward after milestone: `claimReward(7)`

### Test ReferralSystem:
1. Register referral: `registerReferral(referrerAddress)`
2. Record flips (simulate from FlipBattle): `recordFlip(user)`
3. Claim earnings: `claimEarnings()`

### Test DailyFreeFlip:
1. Enter free flip: `enterDailyFlip()`
2. Wait 24 hours (or advance time)
3. End round: `endRound()`
4. Wait for VRF callback
5. Verify winner received prize

## Step 8: Deploy to Base Mainnet

⚠️ **Only after thorough testnet testing!**

### Update `.env` for mainnet:
- Use a fresh private key with mainnet ETH
- Use your mainnet VRF subscription ID
- Double-check all values

### Deploy:
```bash
forge script script/Deploy.s.sol \
  --rpc-url base-mainnet \
  --broadcast \
  --verify \
  -vvvv
```

### Repeat Steps 4-6 for mainnet

## Step 9: Update Frontend

After deployment, update frontend environment variables:

```bash
# apps/web/.env.local
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532  # or 8453 for mainnet
```

## Troubleshooting

### "Insufficient funds for gas"
- Ensure wallet has enough ETH for deployment
- Base Sepolia: Get from faucet
- Base Mainnet: Transfer ETH

### "VRF_SUBSCRIPTION_ID not set"
- Make sure `.env` file exists with correct subscription ID
- Run `source .env` if needed

### "Transaction reverted"
- Check VRF subscription is active and funded
- Verify USDC address is correct for network
- Ensure no previous deployment conflicts

### Verification failed
- Wait a few minutes and try manual verification (Step 6)
- Check Basescan API key is correct
- Ensure contract is fully confirmed on-chain

## Gas Estimates

Approximate gas costs on Base:

| Contract | Deployment Gas | Estimated Cost (Base) |
|----------|---------------|----------------------|
| FlipBattle | ~3,000,000 | ~$0.15 |
| StreakManager | ~1,500,000 | ~$0.08 |
| ReferralSystem | ~1,800,000 | ~$0.09 |
| DailyFreeFlip | ~2,500,000 | ~$0.13 |
| **Total** | **~8,800,000** | **~$0.45** |

*Base has extremely low gas costs (~0.05 gwei typical)*

## Security Checklist

Before mainnet deployment:

- [ ] All tests passing (`forge test`)
- [ ] Contracts fully tested on Base Sepolia
- [ ] VRF subscription funded (50+ LINK for mainnet)
- [ ] Reward contracts funded with USDC
- [ ] Private key is secure and not reused
- [ ] Contract verification successful
- [ ] VRF consumers added to subscription
- [ ] All contract functions tested manually
- [ ] Frontend integration tested
- [ ] Emergency procedures documented

## Post-Deployment

1. **Monitor contracts** - Watch for any unexpected behavior
2. **Set up alerts** - Use Basescan contract alerts
3. **Document addresses** - Save all contract addresses securely
4. **Test small amounts first** - Before announcing publicly
5. **Update documentation** - Share contract addresses with team

## Support

For issues:
- Check logs: `forge script ... -vvvv`
- Basescan: View transactions and events
- VRF Dashboard: Monitor VRF requests
- Foundry Book: https://book.getfoundry.sh

## Resources

- Base Docs: https://docs.base.org
- Chainlink VRF Docs: https://docs.chain.link/vrf/v2/subscription
- Foundry Docs: https://book.getfoundry.sh
- Basescan: https://basescan.org
