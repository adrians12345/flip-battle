# Base Sepolia Testnet Deployment Guide

Complete guide to deploying Flip Battle contracts to Base Sepolia testnet.

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] **Deployer wallet** with Base Sepolia ETH (at least 0.1 ETH for gas)
- [ ] **Chainlink VRF Subscription** created on Base Sepolia
- [ ] **LINK tokens** in your VRF subscription (minimum 2 LINK)
- [ ] **BaseScan API key** for contract verification
- [ ] **Private key** exported from your wallet

---

## 🔗 Step 1: Get Base Sepolia Resources

### 1.1 Get Base Sepolia ETH

**Option A: Coinbase Faucet (Recommended)**
```
https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```
- Connect wallet
- Request 0.1 ETH
- Wait for confirmation

**Option B: QuickNode Faucet**
```
https://faucet.quicknode.com/base/sepolia
```

### 1.2 Get Base Sepolia USDC (Optional, for testing)

Base Sepolia USDC Contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

You can mint test USDC or swap ETH for USDC on Base Sepolia DEXs.

---

## 🎲 Step 2: Create Chainlink VRF Subscription

### 2.1 Visit VRF Dashboard
```
https://vrf.chain.link
```

### 2.2 Connect Wallet
- Connect your wallet (MetaMask, Coinbase Wallet, etc.)
- **Switch to Base Sepolia network** (Chain ID: 84532)

### 2.3 Create Subscription
1. Click **"Create Subscription"**
2. Confirm the transaction in your wallet
3. **Save your Subscription ID** (e.g., 12345)

### 2.4 Fund Subscription with LINK
1. Get Base Sepolia LINK tokens:
   - From: https://faucets.chain.link/base-sepolia
   - Or bridge from another network

2. Add LINK to subscription:
   - Click "Add Funds"
   - Enter amount: **2 LINK** (minimum for testing)
   - Confirm transaction

**Note:** Keep this subscription ID - you'll need it for deployment!

---

## 🔑 Step 3: Get BaseScan API Key

### 3.1 Create BaseScan Account
```
https://basescan.org/register
```

### 3.2 Generate API Key
1. Log in to BaseScan
2. Go to: https://basescan.org/myapikey
3. Click **"Add"** to create new API key
4. **Save your API key** (e.g., ABC123XYZ...)

---

## ⚙️ Step 4: Configure Environment

### 4.1 Export Private Key from Wallet

**MetaMask:**
1. Click account icon → Account Details
2. Click "Show Private Key"
3. Enter password
4. **Copy private key** (WITHOUT the 0x prefix)

**⚠️ SECURITY WARNING:**
- Never share your private key
- Never commit `.env` to git
- Use a dedicated deployment wallet (not your main wallet)

### 4.2 Edit .env File

Open `contracts/.env` and fill in:

```bash
# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=abc123def456...

# Your VRF Subscription ID from Step 2
VRF_SUBSCRIPTION_ID=12345

# Your BaseScan API key from Step 3
BASESCAN_API_KEY=ABC123XYZ...

# Optional: Same as BaseScan key
ETHERSCAN_API_KEY=ABC123XYZ...
```

**Save the file.**

---

## 🚀 Step 5: Deploy Contracts

### 5.1 Navigate to Contracts Directory
```bash
cd contracts
```

### 5.2 Verify Environment
```bash
# Check that .env is loaded
source .env
echo "VRF Subscription ID: $VRF_SUBSCRIPTION_ID"
```

### 5.3 Deploy to Base Sepolia

**Option A: Using Make (Recommended)**
```bash
make deploy-sepolia
```

**Option B: Using Forge Directly**
```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 5.4 Wait for Deployment

The deployment will:
1. Deploy FlipBattle contract
2. Deploy StreakManager contract
3. Deploy ReferralSystem contract
4. Deploy DailyFreeFlip contract
5. Verify all contracts on BaseScan
6. Output contract addresses

**Expected output:**
```
== Deploying to Base Sepolia ==
Chain ID: 84532

Deploying contracts...
✓ FlipBattle deployed to: 0x1234...
✓ StreakManager deployed to: 0x5678...
✓ ReferralSystem deployed to: 0x9abc...
✓ DailyFreeFlip deployed to: 0xdef0...

Verifying contracts on BaseScan...
✓ All contracts verified!

IMPORTANT: Add these consumer addresses to your VRF subscription:
- FlipBattle: 0x1234...
- DailyFreeFlip: 0xdef0...
```

**⚠️ SAVE THESE ADDRESSES!** You'll need them for Step 6 and frontend configuration.

---

## 🔗 Step 6: Add VRF Consumers

After deployment, you must add the contracts as consumers to your VRF subscription:

### 6.1 Go Back to VRF Dashboard
```
https://vrf.chain.link
```

### 6.2 Select Your Subscription
- Click on your subscription ID

### 6.3 Add Consumers
1. Click **"Add Consumer"**
2. Enter **FlipBattle** contract address (from Step 5.4)
3. Confirm transaction
4. Click **"Add Consumer"** again
5. Enter **DailyFreeFlip** contract address
6. Confirm transaction

**Verify:** You should see 2 consumers listed in your subscription.

---

## ✅ Step 7: Verify Deployment

### 7.1 Check Contracts on BaseScan

Visit BaseScan and verify each contract:

```
https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]
```

You should see:
- ✅ Contract verified (green checkmark)
- ✅ Contract source code visible
- ✅ Read/Write functions available

### 7.2 Test Contract Interactions

**Read Functions (no gas required):**

1. **FlipBattle.minimumBet()**
   - Should return: 1000000 (1 USDC)

2. **StreakManager.streakRewards(7)**
   - Should return: 5000000 (5 USDC)

3. **ReferralSystem.REFERRAL_BONUS()**
   - Should return: 1000000 (1 USDC)

**Write Functions (requires gas + USDC):**

Test basic functionality:
```bash
# Get test USDC first!
# Then try creating a flip challenge via BaseScan UI
```

---

## 📝 Step 8: Update Frontend Configuration

### 8.1 Navigate to Frontend Directory
```bash
cd ../apps/web
```

### 8.2 Create/Edit .env.local

```bash
# Copy example
cp .env.local.example .env.local
```

### 8.3 Add Contract Addresses

Edit `.env.local` with your deployed addresses:

```bash
# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Network Configuration
NEXT_PUBLIC_NETWORK=testnet

# Contract Addresses (Base Sepolia) - FROM STEP 5.4
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x1234...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x5678...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x9abc...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0xdef0...

# Optional: Neynar API Key
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_key

# App Metadata
NEXT_PUBLIC_APP_NAME=Flip Battle
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8.4 Test Frontend

```bash
# Run dev server
bun run dev

# Open http://localhost:3000
# Connect wallet (Base Sepolia network)
# Try creating a flip!
```

---

## 🧪 Step 9: End-to-End Testing

### 9.1 Get Test USDC

You need USDC to test the app. Options:
1. Mint test USDC (if contract allows)
2. Swap ETH for USDC on Base Sepolia DEX
3. Use faucet if available

### 9.2 Test Core Flows

**Test 1: Create Flip Challenge**
1. Connect wallet to frontend
2. Enter opponent address
3. Enter bet amount (minimum 1 USDC)
4. Choose heads/tails
5. Approve USDC
6. Create challenge
7. **Verify:** Transaction succeeds, game created

**Test 2: Accept Challenge**
1. Switch to opponent wallet
2. Navigate to Games page
3. Find pending challenge
4. Accept challenge
5. **Verify:** VRF request triggered

**Test 3: Wait for Result**
1. Wait 30-60 seconds for VRF fulfillment
2. Refresh page
3. **Verify:** Result shown, winner determined

**Test 4: Daily Streak**
1. Navigate to Streaks tab
2. Click "Check In Today"
3. **Verify:** Streak incremented

**Test 5: Referral System**
1. Navigate to Referrals tab
2. Copy referral link
3. **Verify:** Link contains your address

---

## 📊 Deployment Checklist

- [ ] VRF subscription created and funded
- [ ] Contracts deployed to Base Sepolia
- [ ] Contracts verified on BaseScan
- [ ] VRF consumers added to subscription
- [ ] Frontend configured with contract addresses
- [ ] Created test flip challenge successfully
- [ ] Accepted challenge and got VRF result
- [ ] Tested streak check-in
- [ ] Tested referral link generation

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution:** Get more Base Sepolia ETH from faucet

### Issue: "VRF subscription not found"
**Solution:** Check VRF_SUBSCRIPTION_ID in .env, ensure subscription exists

### Issue: "Consumer not added"
**Solution:** Add contract addresses as consumers in VRF dashboard

### Issue: "Transaction reverted"
**Solution:** Check USDC approval, ensure sufficient balance

### Issue: "Contract verification failed"
**Solution:** Ensure BASESCAN_API_KEY is correct in .env

### Issue: "VRF request not fulfilled"
**Solution:**
- Check subscription has LINK tokens
- Wait 1-2 minutes for fulfillment
- Check VRF dashboard for pending requests

---

## 📞 Support Resources

- **Chainlink VRF Docs:** https://docs.chain.link/vrf/v2/subscription
- **Base Sepolia Faucet:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **BaseScan (Sepolia):** https://sepolia.basescan.org
- **Base Discord:** https://discord.gg/buildonbase

---

## 🎉 Success!

If all tests pass, your contracts are deployed and working on Base Sepolia testnet!

**Next Steps:**
1. Continue testing all features
2. Fix any bugs found
3. Prepare for mainnet deployment
4. Launch to users!

---

## 📋 Deployed Contract Addresses

After deployment, record your addresses here:

```
FlipBattle: 0x_______________
StreakManager: 0x_______________
ReferralSystem: 0x_______________
DailyFreeFlip: 0x_______________

VRF Subscription ID: _______
Deployment Date: _______
Deployer Address: 0x_______________
```
