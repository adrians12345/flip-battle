# Vercel-Based Deployment Guide

Since you're using Vercel for environment variable management, here's the streamlined deployment process.

## 🚀 Quick Deployment (Base Sepolia)

### Prerequisites

Before running the deployment script, ensure you have:

1. **Base Sepolia ETH** (0.1+ ETH)
   - Get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

2. **Chainlink VRF Subscription** (created and funded)
   - Create at: https://vrf.chain.link
   - Switch to Base Sepolia network
   - Fund with 2+ LINK from: https://faucets.chain.link/base-sepolia

3. **BaseScan API Key**
   - Get from: https://basescan.org/myapikey

4. **Wallet Private Key**
   - Export from MetaMask: Account Details → Show Private Key
   - **⚠️ IMPORTANT**: Copy WITHOUT the `0x` prefix

### Deployment Steps

#### 1. Run the Interactive Deployment Script

```bash
cd contracts
./deploy-sepolia.sh
```

The script will:
- Prompt for your private key (hidden input)
- Ask for VRF Subscription ID
- Ask for BaseScan API Key
- Display configuration summary
- Deploy all 4 contracts
- Verify contracts on BaseScan
- Output contract addresses

#### 2. Add VRF Consumers

After deployment, go to https://vrf.chain.link and add these contracts as consumers:
- **FlipBattle** contract address
- **DailyFreeFlip** contract address

#### 3. Update Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```bash
# Contract Addresses (from deployment output)
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_NETWORK=testnet

# WalletConnect (if not already set)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Farcaster
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_key
```

#### 4. Redeploy Frontend

After updating Vercel environment variables:

```bash
cd ../apps/web
vercel --prod
```

Or simply push to your connected Git repository - Vercel will auto-deploy.

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] All 4 contracts deployed successfully
- [ ] Contracts verified on BaseScan (green checkmark)
- [ ] VRF consumers added to subscription
- [ ] Vercel environment variables updated
- [ ] Frontend redeployed with new contract addresses
- [ ] Can connect wallet on frontend
- [ ] Can create a flip challenge
- [ ] Can accept a challenge
- [ ] VRF fulfillment works (30-60s delay)

---

## 🧪 Testing

### On BaseScan (Testnet)

Visit: https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]

**Read Functions (no gas):**
- `FlipBattle.minimumBet()` → Should return 1000000 (1 USDC)
- `StreakManager.streakRewards(7)` → Should return 5000000 (5 USDC)
- `ReferralSystem.REFERRAL_BONUS()` → Should return 1000000 (1 USDC)

**Write Functions (requires gas + USDC):**
- Create a flip challenge via frontend
- Accept the challenge
- Wait for VRF result
- Check winner and payouts

### On Frontend

1. Visit your Vercel deployment URL
2. Connect wallet (switch to Base Sepolia)
3. Get test USDC (swap ETH or use faucet)
4. Create a flip challenge
5. Accept challenge from another wallet
6. Verify result after VRF fulfillment

---

## 🚨 Troubleshooting

### "Insufficient funds for gas"
**Solution**: Get more Base Sepolia ETH from faucet

### "VRF subscription not found"
**Solution**: Check VRF Subscription ID, ensure subscription exists

### "Consumer not added"
**Solution**: Add contract addresses as consumers in VRF dashboard

### "Transaction reverted"
**Solution**:
- Check USDC approval
- Ensure sufficient USDC balance
- Verify minimum bet amount (1 USDC)

### "Contract verification failed"
**Solution**:
- Ensure BaseScan API key is correct
- Verification can be done manually later on BaseScan

### "VRF request not fulfilled"
**Solution**:
- Check subscription has LINK tokens
- Wait 1-2 minutes for fulfillment
- Check VRF dashboard for pending requests

---

## 📞 Resources

- **Chainlink VRF Dashboard**: https://vrf.chain.link
- **Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **LINK Faucet**: https://faucets.chain.link/base-sepolia
- **BaseScan (Sepolia)**: https://sepolia.basescan.org
- **Base Docs**: https://docs.base.org
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All contracts deployed and verified on BaseScan
✅ VRF consumers added to subscription
✅ Frontend deployed with correct contract addresses
✅ Can create and accept flip challenges
✅ VRF randomness works correctly
✅ Streak check-ins work
✅ Referral system tracks properly
✅ Daily free flip is playable

---

## 📝 Deployment Record

After deployment, record your addresses:

```
=== Base Sepolia Deployment ===
Date: _____________

FlipBattle: 0x_______________
StreakManager: 0x_______________
ReferralSystem: 0x_______________
DailyFreeFlip: 0x_______________

VRF Subscription ID: _______
Deployer Address: 0x_______________
```

---

## 🔄 Alternative: Manual Deployment

If you prefer manual control, you can also deploy directly with forge:

```bash
# Set environment variables in terminal
export PRIVATE_KEY="your_private_key_without_0x"
export VRF_SUBSCRIPTION_ID="12345"
export BASESCAN_API_KEY="your_api_key"
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

# Deploy
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

---

## 🔐 Security Notes

**⚠️ IMPORTANT:**
- Never commit private keys to git
- Never share your private key
- Use a dedicated deployment wallet (not your main wallet)
- Store sensitive data in Vercel environment variables only
- The `.env` file is gitignored for your safety
