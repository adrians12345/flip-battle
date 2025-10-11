# ActivityGenerator Deployment & Automation Guide
**Date: October 11, 2025**
**Network: Base Mainnet (Chain ID: 8453)**

## Prerequisites

### 1. Get a Basescan API Key

1. Go to [https://basescan.org](https://basescan.org)
2. Sign up for an account or log in
3. Navigate to **API Keys** in your account settings
4. Click the blue **"Add"** button
5. Copy your API Key Token
6. **Note**: This key now works across all Etherscan-compatible explorers

### 2. Fund Your Wallet

You need ETH on Base mainnet for:
- Deployment gas (~$0.50-$2)
- Transaction gas for automation (~$0.01-$0.05 per transaction)

**Minimum recommended: 0.01 ETH on Base**

You can bridge ETH to Base via:
- [bridge.base.org](https://bridge.base.org) (official)
- Any major CEX that supports Base

### 3. Environment Setup

```bash
cd contracts

# Create .env file
cat > .env << 'EOF'
PRIVATE_KEY=your_private_key_here_without_0x_prefix
BASESCAN_API_KEY=your_basescan_api_key_here
EOF
```

**CRITICAL**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Step 1: Compile the Contract

```bash
cd contracts
forge build
```

You should see:
```
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.28
[⠢] Solc 0.8.28 finished in X.XXs
Compiler run successful!
```

---

## Step 2: Deploy to Base Mainnet

### Option A: Automated Deployment (Recommended)

```bash
./deploy-activity.sh
```

The script will:
1. Check your wallet balance
2. Confirm deployment details
3. Deploy the contract
4. Automatically verify on Basescan
5. Output the contract address

### Option B: Manual Deployment

```bash
forge script script/DeployActivity.s.sol:DeployActivity \
    --rpc-url https://mainnet.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv
```

**Save the contract address from the output!**

---

## Step 3: Verify Contract Ownership (IMPORTANT!)

After deployment, you MUST verify ownership from your personal wallet:

### Method 1: Via Basescan Web Interface

1. Go to `https://basescan.org/address/<YOUR_CONTRACT_ADDRESS>`
2. Click **"Contract"** tab
3. Click **"Write Contract"**
4. Click **"Connect to Web3"**
5. Connect your deployer wallet (the one you deployed from)
6. Call the `recordActivity()` function (this is free and proves ownership)
7. Sign the transaction in your wallet
8. Wait for confirmation

### Method 2: Via Command Line

```bash
# Add contract address to your .env
echo "ACTIVITY_CONTRACT_ADDRESS=0x_your_contract_address" >> .env

# Test the contract
cast send $ACTIVITY_CONTRACT_ADDRESS \
    "recordActivity()" \
    --rpc-url https://mainnet.base.org \
    --private-key $PRIVATE_KEY
```

### Method 3: Verify Deployment Transaction

The deployment transaction itself proves ownership:

1. Go to Basescan: `https://basescan.org/tx/<DEPLOYMENT_TX_HASH>`
2. Look for "From" address - this should match your wallet
3. The "To" field will be empty (contract creation)
4. The "Contract Created" section shows your contract address

**This transaction permanently records you as the deployer on-chain.**

---

## Step 4: Manual Contract Verification (If Auto-Verify Failed)

If the automated verification failed during deployment:

```bash
forge verify-contract <CONTRACT_ADDRESS> \
    src/ActivityGenerator.sol:ActivityGenerator \
    --chain 8453 \
    --etherscan-api-key $BASESCAN_API_KEY \
    --watch
```

**Important**: In 2025, Foundry uses `--etherscan-api-key` for ALL explorers, including Basescan. The old `--verifier-url` method is deprecated.

You'll see:
```
Start verifying contract `0x...` deployed on base

Submitting verification for [src/ActivityGenerator.sol:ActivityGenerator] "0x..."
Submitted contract for verification:
        Response: `OK`
        GUID: `xxxxx`
        URL: https://basescan.org/address/0x.../
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`

Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
```

---

## Step 5: Set Up Automated Activity Bot

### Configure the Bot

```bash
# Add contract address to .env
echo "ACTIVITY_CONTRACT_ADDRESS=your_deployed_contract_address" >> .env
```

### Test the Bot (Dry Run)

```bash
bun contracts/activity-bot.ts
```

You'll see initialization output. Press Ctrl+C to stop after verifying it connects.

### Run the Bot in Production

#### Option A: Using Screen (Simple)

```bash
screen -S activity-bot
bun contracts/activity-bot.ts
# Press Ctrl+A then D to detach
# Reattach with: screen -r activity-bot
```

#### Option B: Using PM2 (Recommended for VPS)

```bash
# Install PM2 globally
bun add -g pm2

# Start bot
pm2 start contracts/activity-bot.ts --name activity-bot --interpreter bun

# View logs
pm2 logs activity-bot

# Stop bot
pm2 stop activity-bot

# Restart bot
pm2 restart activity-bot

# Make bot start on system boot
pm2 startup
pm2 save
```

---

## Configuration Options

Edit these values in `activity-bot.ts`:

```typescript
const config: BotConfig = {
  privateKey,
  contractAddress,
  minDelayMinutes: 30,    // Min time between transactions
  maxDelayMinutes: 90,    // Max time between transactions
  transactionsPerDay: 20, // Target daily transactions
};
```

**Recommended settings for Builder Score:**
- 15-30 transactions per day
- 30-90 minute delays (randomized)
- Mix of activity types (automatic)

---

## Monitoring Your Activity

### View on Basescan

```
https://basescan.org/address/<YOUR_CONTRACT_ADDRESS>
```

You'll see all transactions under the "Transactions" tab.

### Check Stats Programmatically

```bash
cast call $ACTIVITY_CONTRACT_ADDRESS \
    "getActivityStats(address)(uint256,uint256)" \
    $YOUR_WALLET_ADDRESS \
    --rpc-url https://mainnet.base.org
```

Returns:
- Total activity count
- Last activity timestamp

---

## Troubleshooting

### "Invalid API key" Error

- Make sure you're using a Basescan API key (get from basescan.org)
- In 2025, use `--etherscan-api-key` for ALL explorers
- Etherscan API keys from etherscan.io now work on Basescan too

### "Insufficient funds" Error

- Fund your wallet with more ETH on Base
- Each transaction costs ~$0.01-$0.05
- Recommended: Keep 0.01 ETH minimum

### Verification Fails

```bash
# Check if already verified
cast call $ACTIVITY_CONTRACT_ADDRESS \
    "owner()(address)" \
    --rpc-url https://mainnet.base.org

# If it returns your address, contract is deployed correctly
# Verification is just for Basescan display, not functionality
```

### Bot Crashes

```bash
# View PM2 logs
pm2 logs activity-bot --lines 100

# Restart with more verbose logging
pm2 restart activity-bot
```

---

## Security Best Practices

1. **Never commit `.env` file**
2. **Use a dedicated wallet for automation** (not your main wallet)
3. **Fund only what you need** (~0.01-0.05 ETH at a time)
4. **Monitor activity regularly**
5. **Set reasonable transaction limits**

---

## Network Information (October 2025)

- **Network Name**: Base
- **Chain ID**: 8453 (0x2105)
- **RPC URL**: https://mainnet.base.org
- **Currency**: ETH
- **Block Explorer**: https://basescan.org

---

## Cost Estimates

- **Deployment**: ~$0.50-$2.00 (one-time)
- **Verification**: Free
- **Each Activity**: ~$0.01-$0.05
- **Daily Cost** (20 tx/day): ~$0.20-$1.00
- **Monthly Cost**: ~$6-$30

---

## Quick Start Summary

```bash
# 1. Setup
cd contracts
# Edit .env with your keys

# 2. Deploy
./deploy-activity.sh

# 3. Verify ownership (via Basescan UI)
# Connect wallet and call recordActivity()

# 4. Configure bot
echo "ACTIVITY_CONTRACT_ADDRESS=0x..." >> .env

# 5. Run bot
pm2 start contracts/activity-bot.ts --name activity-bot --interpreter bun

# 6. Monitor
pm2 logs activity-bot
```

---

## Support & Resources

- **Base Docs**: https://docs.base.org
- **Basescan**: https://basescan.org
- **Foundry Book**: https://book.getfoundry.sh
- **Base Discord**: https://discord.gg/buildonbase
