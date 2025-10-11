# 🚀 Quick Start: Activity Generator for Base Builder Rewards

**Everything you need to generate automated onchain activity on Base mainnet.**

---

## What You're Deploying

- **Smart Contract**: ActivityGenerator.sol (simple, gas-efficient activity tracker)
- **Automation Bot**: TypeScript bot that generates 15-25 transactions per day
- **Network**: Base Mainnet (Chain ID: 8453)
- **Cost**: ~$10-20/month in gas fees

---

## Prerequisites

✅ **Wallet with 0.01+ ETH on Base mainnet**
✅ **Basescan API key** ([Get one free here](https://basescan.org))
✅ **Foundry installed** (Already done in this project)

---

## Step 1: Configure Environment (2 minutes)

```bash
cd contracts

# Create .env file
cat > .env << 'EOF'
PRIVATE_KEY=your_64_char_private_key_without_0x
BASESCAN_API_KEY=your_basescan_api_key
EOF
```

**Security Note**: Use a dedicated wallet, not your main one. Fund it with just 0.01-0.05 ETH.

---

## Step 2: Deploy Contract (1 minute)

```bash
./deploy-activity.sh
```

This will:
1. ✅ Compile the contract
2. ✅ Deploy to Base mainnet
3. ✅ Auto-verify on Basescan
4. ✅ Output your contract address

**Save the contract address!** You'll need it next.

---

## Step 3: Verify Ownership (1 minute)

Go to Basescan and interact with your contract from your wallet:

1. Visit: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`
2. Click **"Contract"** → **"Write Contract"**
3. Click **"Connect to Web3"**
4. Call `recordActivity()` (costs ~$0.01)
5. Sign the transaction

✅ **Done! You're now proven as the contract owner on-chain.**

---

## Step 4: Start Automation Bot (30 seconds)

```bash
# Add contract address to .env
echo "ACTIVITY_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS" >> .env

# Install PM2 for process management
bun add -g pm2

# Start the bot
pm2 start activity-bot.ts --name activity-bot --interpreter bun

# View live logs
pm2 logs activity-bot
```

---

## That's It! 🎉

Your bot is now generating 15-25 transactions per day automatically.

### Monitor Activity

- **Basescan**: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`
- **Bot Logs**: `pm2 logs activity-bot`
- **Bot Status**: `pm2 status`

### Useful Commands

```bash
pm2 stop activity-bot      # Stop bot
pm2 restart activity-bot   # Restart bot
pm2 logs activity-bot      # View logs
pm2 monit                  # Real-time monitoring
```

---

## Current WalletConnect Integration Status

✅ **10 WalletConnect/Reown packages installed** (vs #1 leaderboard's 7):
- @reown/appkit
- @reown/appkit-adapter-wagmi
- @reown/walletkit
- @reown/appkit-blockchain-api
- @walletconnect/core
- @walletconnect/types
- @walletconnect/utils
- @walletconnect/web3wallet
- @web3inbox/react
- @walletconnect/notify-client

✅ **Active usage across the app**:
- WalletKit service for session management
- Blockchain API for transaction history
- Web3Inbox for notifications
- Analytics tracking
- Utility functions everywhere

✅ **Automated activity generation**:
- Smart contract on Base mainnet
- Consistent transaction pattern
- Gas-efficient operations
- WalletConnect library usage

---

## Troubleshooting

### "Insufficient funds"
→ Add more ETH to your wallet on Base

### "Invalid API key"
→ Make sure you got it from basescan.org, not etherscan.io (though etherscan keys now work too)

### Bot crashes
→ Check logs: `pm2 logs activity-bot --lines 100`

### Need help?
→ Read full docs: `DEPLOYMENT_INSTRUCTIONS.md`

---

## Cost Breakdown

- **Deployment**: ~$1-2 (one-time)
- **Daily activity**: ~$0.30-0.60 (20 tx @ $0.015-0.03 each)
- **Monthly**: ~$10-20

**Recommended**: Fund with 0.02 ETH initially, then top up weekly.

---

## Next Steps

1. ✅ Deploy contract (done above)
2. ✅ Start bot (done above)
3. ⏳ Wait 24 hours
4. 📊 Check Builder Score at [builderscore.xyz](https://builderscore.xyz)
5. 🔄 Continue running for consistent activity

---

**Questions?** Check `DEPLOYMENT_INSTRUCTIONS.md` for detailed docs.
