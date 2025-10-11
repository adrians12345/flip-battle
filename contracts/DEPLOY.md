# Deploy & Run Guide

## Quick Setup

### 1. Fund Wallet
- Bridge **0.005 ETH** to Base mainnet
- Use: https://bridge.base.org
- This will last **4-8 months**

### 2. Configure
```bash
cd contracts

cat > .env << 'EOF'
PRIVATE_KEY=your_private_key_without_0x
BASESCAN_API_KEY=your_api_key_from_basescan.org
EOF
```

### 3. Deploy
```bash
# Compile
forge build

# Deploy to Base mainnet
./deploy-activity.sh

# Save the contract address!
```

### 4. Start Bot
```bash
# Add contract address to .env
echo "ACTIVITY_CONTRACT_ADDRESS=0xYOUR_ADDRESS" >> .env

# Install PM2
bun add -g pm2

# Start bot
pm2 start activity-bot.ts --name activity-bot --interpreter bun

# Check it's running
pm2 logs activity-bot
```

### 5. View Dashboard
```bash
# Option A: Terminal dashboard
bun dashboard.ts

# Option B: Web dashboard
cd dashboard-web
bun install
bun dev
# Open http://localhost:3001
```

---

## System Overview

**Contract:** Gas-optimized ActivityGenerator
- `recordActivity()` - 21k gas (**$0.005/tx**)
- `pingContract()` - 21k gas (**$0.005/tx**)
- `batchRecordActivity()` - 32k gas (**$0.008/tx**)
- `storeMessage()` - 55k gas (**$0.013/tx**)

**Bot:** Automated transaction generator
- 20 transactions/day by default
- 30-90 minute randomized delays
- Weighted towards cheapest functions
- **Cost: $0.10-0.12/day** ($3-4/month)

**Dashboard:** Real-time monitoring
- Total activities
- Last activity time
- Wallet balance
- Days remaining
- Health status

---

## Costs

| ETH Amount | Cost | Duration |
|------------|------|----------|
| 0.01 ETH | $30 | 8-10 months |
| 0.005 ETH | $15 | 4-5 months |
| 0.002 ETH | $6 | 50-60 days |

---

## WalletConnect Integration

**✅ 10 packages installed:**
1. @reown/appkit
2. @reown/appkit-adapter-wagmi
3. @reown/walletkit
4. @reown/appkit-blockchain-api
5. @walletconnect/core
6. @walletconnect/types
7. @walletconnect/utils
8. @walletconnect/web3wallet
9. @web3inbox/react
10. @walletconnect/notify-client

**Active usage:**
- apps/web/package.json (dependencies)
- apps/web/app/lib/web3.ts (config)
- apps/web/app/lib/walletkit.ts (service)
- apps/web/app/lib/blockchain-api.ts (API)
- apps/web/app/lib/walletconnect-utils.ts (utilities)
- apps/web/app/lib/analytics.ts (tracking)
- apps/web/app/components/Web3Provider.tsx (provider)
- apps/web/app/components/ConnectButton.tsx (UI)

---

## Commands Reference

```bash
# Bot Management
pm2 start activity-bot.ts --name activity-bot --interpreter bun
pm2 stop activity-bot
pm2 restart activity-bot
pm2 logs activity-bot
pm2 monit

# Dashboard
bun dashboard.ts                    # Terminal
cd dashboard-web && bun dev        # Web (localhost:3001)

# Contract
forge build                        # Compile
./deploy-activity.sh              # Deploy
forge verify-contract ...         # Manual verify

# Check Balance
cast balance YOUR_ADDRESS --rpc-url https://mainnet.base.org
```

---

## Links

- **Basescan:** https://basescan.org/address/YOUR_CONTRACT
- **Leaderboard:** https://builderscore.xyz
- **Bridge:** https://bridge.base.org

---

## File Structure

```
contracts/
├── src/ActivityGenerator.sol          # Gas-optimized contract
├── script/DeployActivity.s.sol        # Deployment script
├── deploy-activity.sh                 # Automated deploy
├── activity-bot.ts                    # Automation bot
├── dashboard.ts                       # Terminal dashboard
├── dashboard-web/                     # Web dashboard
│   ├── app/page.tsx                  # Main dashboard UI
│   └── package.json
├── .env                              # Your config
└── OPTIMIZATION_REPORT.md            # Gas analysis

apps/web/
├── app/lib/
│   ├── web3.ts                       # WalletConnect config
│   ├── walletkit.ts                  # WalletKit service
│   ├── blockchain-api.ts             # Blockchain API
│   ├── walletconnect-utils.ts        # Utilities
│   └── analytics.ts                  # Analytics
└── package.json                      # 10 WalletConnect packages
```

---

## Expected Results

**Week 1:**
- 140 transactions
- $0.70-0.84 spent
- Visible on Basescan

**Month 1:**
- 600 transactions
- $3-4 spent
- Consistent Builder Score

**Month 3:**
- 1,800 transactions
- $9-12 spent
- Competitive ranking

---

## Troubleshooting

**Bot not running:**
```bash
pm2 logs activity-bot --lines 50
pm2 restart activity-bot
```

**Dashboard shows no data:**
- Check contract address in .env
- Check wallet address
- Verify contract is deployed

**Low balance warning:**
```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url https://mainnet.base.org

# Bridge more ETH
# Visit https://bridge.base.org
```

---

## That's It!

System is production-ready and optimized for **minimum gas costs** while maintaining **consistent onchain activity** for Builder Score.

**Total Setup Time:** 5 minutes
**Monthly Cost:** $3-4
**Maintenance:** None (runs automatically)
