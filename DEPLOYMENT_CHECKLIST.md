# Flip Battle - Deployment Checklist

Complete checklist for deploying Flip Battle to Base Sepolia testnet.

## 🎯 Quick Start

**Time Required**: ~1-2 hours (including waiting for VRF)

**Prerequisites**: Wallet with ~0.1 ETH on Base Sepolia

---

## ✅ Pre-Deployment Checklist

### 1. Get Base Sepolia ETH

- [ ] Visit https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- [ ] Connect wallet
- [ ] Request 0.1 ETH (or more)
- [ ] Verify ETH received in wallet

**Check balance**:
```bash
cast balance <YOUR_ADDRESS> --rpc-url https://sepolia.base.org
```

---

### 2. Create Chainlink VRF Subscription

- [ ] Visit https://vrf.chain.link
- [ ] Connect wallet
- [ ] Switch to **Base Sepolia** network (Chain ID: 84532)
- [ ] Click "Create Subscription"
- [ ] Confirm transaction
- [ ] **SAVE YOUR SUBSCRIPTION ID** (e.g., 12345)

---

### 3. Fund VRF Subscription with LINK

- [ ] Get Base Sepolia LINK from https://faucets.chain.link/base-sepolia
- [ ] Go back to VRF dashboard
- [ ] Select your subscription
- [ ] Click "Add Funds"
- [ ] Add **2+ LINK** (recommended: 5 LINK)
- [ ] Confirm transaction
- [ ] Verify LINK balance shows in subscription

---

### 4. Get BaseScan API Key

- [ ] Go to https://basescan.org/register
- [ ] Create account (if needed)
- [ ] Go to https://basescan.org/myapikey
- [ ] Click "Add" to create new API key
- [ ] **SAVE YOUR API KEY** (e.g., ABC123XYZ...)

---

### 5. Get WalletConnect Project ID

- [ ] Go to https://cloud.walletconnect.com
- [ ] Sign up / Log in
- [ ] Create new project
- [ ] **SAVE YOUR PROJECT ID**

---

### 6. Export Private Key

**⚠️ SECURITY WARNING**: Use a dedicated deployment wallet, NOT your main wallet!

**MetaMask**:
- [ ] Click account icon
- [ ] Account Details
- [ ] Show Private Key
- [ ] Enter password
- [ ] **COPY PRIVATE KEY** (WITHOUT 0x prefix)

**Coinbase Wallet**:
- [ ] Settings → Security
- [ ] Show Private Key
- [ ] **COPY PRIVATE KEY** (WITHOUT 0x prefix)

---

## 🚀 Deployment Steps

### 7. Deploy Smart Contracts

```bash
cd contracts
./deploy-sepolia.sh
```

The script will prompt for:
- [ ] Private Key (hidden input)
- [ ] VRF Subscription ID
- [ ] BaseScan API Key

**Expected output**:
```
✅ Deployment successful!
FlipBattle deployed to: 0x...
StreakManager deployed to: 0x...
ReferralSystem deployed to: 0x...
DailyFreeFlip deployed to: 0x...
```

- [ ] **SAVE ALL 4 CONTRACT ADDRESSES**

**Verify on BaseScan**:
- [ ] FlipBattle: https://sepolia.basescan.org/address/[ADDRESS]
- [ ] StreakManager: https://sepolia.basescan.org/address/[ADDRESS]
- [ ] ReferralSystem: https://sepolia.basescan.org/address/[ADDRESS]
- [ ] DailyFreeFlip: https://sepolia.basescan.org/address/[ADDRESS]

Each should show:
- [ ] ✅ Green verified checkmark
- [ ] ✅ Source code visible
- [ ] ✅ Read/Write tabs available

---

### 8. Add VRF Consumers

**Important**: Contracts can't receive VRF responses without this!

- [ ] Go to https://vrf.chain.link
- [ ] Select your subscription
- [ ] Click "Add Consumer"
- [ ] Enter **FlipBattle** contract address
- [ ] Confirm transaction
- [ ] Click "Add Consumer" again
- [ ] Enter **DailyFreeFlip** contract address
- [ ] Confirm transaction

**Verify**:
- [ ] Subscription shows 2 consumers
- [ ] FlipBattle address listed
- [ ] DailyFreeFlip address listed

---

### 9. Test Contracts Manually

Run the contract testing script:

```bash
cd contracts
./test-contracts.sh
```

- [ ] Enter your 4 contract addresses
- [ ] Verify all values display correctly
- [ ] Check minimum bet = 1 USDC
- [ ] Check platform fee = 5%
- [ ] Check streak rewards show correctly

---

### 10. Update Vercel Environment Variables

**Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```bash
# Contract Addresses (from Step 7)
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...

# Network
NEXT_PUBLIC_NETWORK=testnet

# WalletConnect (from Step 5)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: Farcaster
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_key
```

Checklist:
- [ ] All 4 contract addresses added
- [ ] NEXT_PUBLIC_NETWORK=testnet
- [ ] WalletConnect Project ID added
- [ ] Variables set for Production (and Preview if needed)

---

### 11. Deploy Frontend to Vercel

**Option A: Git Push (Recommended)**
```bash
git add .
git commit -m "Deploy Flip Battle to testnet"
git push origin main
```
- [ ] Push to connected Git repo
- [ ] Vercel auto-deploys
- [ ] Wait for deployment to complete

**Option B: Vercel CLI**
```bash
cd apps/web
vercel --prod
```
- [ ] Run vercel command
- [ ] Follow prompts
- [ ] Wait for deployment

**Verify**:
- [ ] Deployment successful
- [ ] Visit deployed URL
- [ ] Homepage loads correctly
- [ ] No console errors

---

## 🧪 Testing Phase

### 12. Get Test USDC

See `TEST_USDC_GUIDE.md` for detailed instructions.

**Quick options**:
- [ ] Circle faucet: https://faucet.circle.com/
- [ ] Swap ETH for USDC on Base Sepolia DEX
- [ ] Ask in Base Discord: https://discord.gg/buildonbase

**Get USDC for**:
- [ ] Wallet A (your main test wallet)
- [ ] Wallet B (secondary test wallet)

Recommended: 50+ USDC per wallet

---

### 13. Run Test Scenarios

Follow `contracts/TESTING_GUIDE.md` for full test scenarios.

**Essential Tests**:

#### Test 1: Basic Flip Challenge
- [ ] Connect Wallet A to frontend
- [ ] Create challenge (opponent: Wallet B, bet: 1 USDC)
- [ ] Switch to Wallet B
- [ ] Accept challenge
- [ ] Wait 30-60 seconds for VRF
- [ ] Verify winner determined
- [ ] Check USDC payout correct

#### Test 2: Daily Streak
- [ ] Navigate to Streaks tab
- [ ] Click "Check In Today"
- [ ] Verify streak = 1
- [ ] Try to check in again (should fail)

#### Test 3: Referral System
- [ ] Navigate to Referrals tab
- [ ] Copy referral link
- [ ] Open link in new browser/wallet
- [ ] Verify referral registered
- [ ] Create bet as referral
- [ ] Check referrer earnings (1 USDC + 5% of bet)

#### Test 4: Daily Free Flip
- [ ] Navigate to Daily Free tab
- [ ] Enter free flip
- [ ] Wait for result
- [ ] Try to play again (should fail)

#### Test 5: Cancel Challenge
- [ ] Create challenge
- [ ] Cancel before acceptance
- [ ] Verify USDC refunded

---

### 14. Verify All Features

**Frontend**:
- [ ] Homepage loads
- [ ] Wallet connection works
- [ ] All tabs accessible (Flip, Daily, Streaks, Referrals)
- [ ] Games page loads
- [ ] Profile page loads
- [ ] Stats display correctly
- [ ] Live event feed updates
- [ ] Toast notifications appear
- [ ] Mobile responsive
- [ ] No console errors

**Contracts**:
- [ ] Can create flip challenges
- [ ] Can accept challenges
- [ ] VRF fulfillment works (30-60s)
- [ ] Winners determined correctly
- [ ] USDC payouts correct (95% to winner, 5% fee)
- [ ] Streak check-ins work
- [ ] Referral tracking works
- [ ] Daily free flip works
- [ ] Can cancel challenges
- [ ] Challenges expire after 24h

**Integration**:
- [ ] Contract events trigger frontend updates
- [ ] USDC approvals work
- [ ] Wallet balance updates
- [ ] Transaction confirmations show
- [ ] Error messages helpful

---

## 📊 Post-Deployment

### 15. Document Deployment

Record your deployment details:

```
=== Flip Battle Base Sepolia Deployment ===
Date: _____________
Deployer: 0x_______________

Contract Addresses:
- FlipBattle: 0x_______________
- StreakManager: 0x_______________
- ReferralSystem: 0x_______________
- DailyFreeFlip: 0x_______________

VRF Subscription ID: _______
VRF LINK Balance: _______ LINK

Frontend URL: https://_______________

Test Results:
- Basic Flip: ✅/❌
- Daily Streak: ✅/❌
- Referrals: ✅/❌
- Daily Free Flip: ✅/❌
- Cancel Challenge: ✅/❌

Issues Found:
1. _______________
2. _______________

Overall Status: ✅ READY FOR USERS / ❌ NEEDS FIXES
```

---

### 16. Monitor & Maintain

**Daily Monitoring**:
- [ ] Check VRF subscription LINK balance
- [ ] Monitor VRF fulfillments on dashboard
- [ ] Check for failed transactions
- [ ] Review user activity

**Weekly**:
- [ ] Review all test scenarios
- [ ] Check for bugs reported
- [ ] Monitor gas costs
- [ ] Review contract balances

**Alerts**:
- [ ] Set up VRF subscription low balance alert
- [ ] Monitor contract for security issues
- [ ] Track frontend errors (Sentry recommended)

---

### 17. Prepare for Mainnet

Once testnet is stable:

- [ ] Document all bugs found and fixed
- [ ] Review gas optimization opportunities
- [ ] Consider security audit
- [ ] Update documentation with lessons learned
- [ ] Implement production Neynar integration
- [ ] Plan mainnet deployment timeline
- [ ] Prepare marketing/launch strategy

---

## 🆘 Troubleshooting

### "Deployment failed"
- Check Base Sepolia ETH balance
- Verify VRF_SUBSCRIPTION_ID is correct
- Ensure LINK subscription exists

### "Contract verification failed"
- Check BASESCAN_API_KEY is valid
- Can verify manually later on BaseScan

### "VRF request not fulfilled"
- Check LINK balance in subscription
- Verify consumers added correctly
- Wait up to 2 minutes
- Check VRF dashboard for errors

### "Transaction reverted"
- Check USDC approval granted
- Verify sufficient USDC balance
- Check minimum bet (1 USDC)
- Verify wallet has ETH for gas

### "Frontend shows wrong data"
- Verify contract addresses in Vercel env vars
- Check network (testnet vs mainnet)
- Clear browser cache
- Check console for errors

---

## 📞 Support

**Documentation**:
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `TESTING_GUIDE.md` - Comprehensive test scenarios
- `TEST_USDC_GUIDE.md` - Getting testnet USDC
- `PROJECT_STATUS.md` - Overall project status

**External Resources**:
- Base Discord: https://discord.gg/buildonbase
- Chainlink Discord: https://discord.gg/chainlink
- Base Docs: https://docs.base.org
- Chainlink VRF Docs: https://docs.chain.link/vrf

**Quick Commands**:
```bash
# Deploy contracts
cd contracts && ./deploy-sepolia.sh

# Test contracts
cd contracts && ./test-contracts.sh

# Build frontend
cd apps/web && bun run build

# Deploy frontend
vercel --prod
```

---

## ✅ Final Checklist

Before declaring "Deployment Complete":

**Contracts**:
- [ ] All 4 contracts deployed
- [ ] All contracts verified on BaseScan
- [ ] VRF consumers added
- [ ] Contract testing script passes
- [ ] Manual testing successful

**Frontend**:
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Homepage loads
- [ ] Wallet connection works
- [ ] Contract integration working

**Testing**:
- [ ] All 5 essential tests pass
- [ ] No blocking bugs found
- [ ] VRF fulfillment working
- [ ] USDC transfers working
- [ ] Mobile responsive

**Documentation**:
- [ ] Deployment details recorded
- [ ] Contract addresses saved
- [ ] Known issues documented
- [ ] Monitoring plan in place

---

## 🎉 Success!

Once all checkboxes are complete:

✅ **Flip Battle is live on Base Sepolia testnet!**

**Next Steps**:
1. Share testnet URL with friends for feedback
2. Monitor performance and gather data
3. Fix any issues that arise
4. Prepare for mainnet deployment
5. Launch to the world! 🚀

**Good luck!** 🪙
