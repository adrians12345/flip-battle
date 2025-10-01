# 🚀 Flip Battle - Quick Start Guide

## 📋 Prerequisites

- **Node.js:** v20+ (use `nvm install 20`)
- **Bun:** Latest version (`curl -fsSL https://bun.sh/install | bash`)
- **Foundry:** Latest version (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- **Git:** Latest version
- **Vercel CLI:** `npm i -g vercel`

## ⚡ Setup (5 Minutes)

### 1. Install Dependencies

```bash
# Install frontend dependencies
bun install

# Install Foundry dependencies for contracts
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink
forge install foundry-rs/forge-std
cd ..
```

### 2. Get API Keys

**WalletConnect:**
1. Go to https://cloud.walletconnect.com
2. Create new project "Flip Battle"
3. Copy Project ID
4. Add to Vercel environment variables: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

**Neynar (Farcaster):**
1. Go to https://neynar.com
2. Sign up for developer account
3. Create API key
4. Add to Vercel: `NEYNAR_API_KEY`

**Basescan:**
1. Go to https://basescan.org
2. Create account
3. Get API key
4. Add to Vercel: `BASESCAN_API_KEY`

### 3. Configure Vercel Environment Variables

```bash
vercel link  # Link to your Vercel project

# Add environment variables
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
vercel env add NEYNAR_API_KEY
vercel env add BASESCAN_API_KEY
vercel env add PRIVATE_KEY  # Your deployer wallet private key
```

### 4. Get Testnet Funds

```bash
# Get Base Sepolia ETH from faucet
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# Get USDC testnet tokens
# Bridge from Sepolia or use faucet
```

## 🔨 Development

### Start Development Server

```bash
# Terminal 1: Frontend
bun run dev

# Terminal 2: Watch contracts
cd contracts && forge build --watch
```

Visit: http://localhost:3000

### Build & Test Contracts

```bash
cd contracts

# Compile contracts
forge build

# Run tests
forge test

# Run tests with gas report
forge test --gas-report

# Run specific test
forge test --match-test testCreateChallenge -vvv
```

### Deploy to Testnet

```bash
cd contracts

# Deploy to Base Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY

# Save contract addresses
echo "NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x..." >> ../vercel-env.txt
echo "NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x..." >> ../vercel-env.txt
```

## 🧪 Testing Flow

### 1. Connect Wallet
- Open app at localhost:3000
- Click "Connect Wallet"
- Select Coinbase Wallet or MetaMask
- Approve connection to Base Sepolia

### 2. Create Challenge
- Enter opponent username (or leave empty)
- Select bet amount ($1)
- Choose heads or tails
- Approve USDC spending
- Confirm transaction
- Wait for confirmation (~2 seconds)

### 3. Accept Challenge
- Open game URL in new browser/wallet
- Connect with different wallet
- Click "Accept Challenge"
- Approve USDC spending
- Confirm transaction

### 4. Watch Flip
- Coin flip animation plays
- Chainlink VRF generates random result
- Winner announced
- Payout sent automatically
- Stats updated

### 5. Test Free Features
- Click "Daily Check-in" (gas only)
- Claim daily free flip
- Check streak progress
- Share referral link

## 🚀 Deploy to Production

### Deploy Contracts (Mainnet)

```bash
cd contracts

# CAREFUL: Real money!
forge script script/Deploy.s.sol \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY

# Save addresses to Vercel
vercel env add NEXT_PUBLIC_FLIP_BATTLE_ADDRESS production
# ... etc
```

### Set Up Chainlink VRF

1. Go to https://vrf.chain.link
2. Create subscription on Base Mainnet
3. Fund with 10 LINK tokens
4. Add FlipBattle contract as consumer
5. Note subscription ID
6. Update contract with subscription ID

### Deploy Frontend

```bash
# Deploy to Vercel production
vercel --prod

# Your app is live at: https://flipbattle.xyz
```

## 📊 Post-Launch Checklist

- [ ] Test wallet connection
- [ ] Create test flip challenge
- [ ] Accept challenge (different wallet)
- [ ] Verify flip result
- [ ] Test daily check-in
- [ ] Test referral system
- [ ] Check Basescan for transactions
- [ ] Verify auto-casts on Farcaster
- [ ] Monitor error logs (Vercel)
- [ ] Check WalletConnect analytics

## 🎯 First Week Tasks

### Day 1 (Launch Day)
```bash
# Morning
- Deploy to mainnet
- Test all features
- Create launch post
- Share on Farcaster
- Monitor closely

# Afternoon
- Respond to users
- Fix critical bugs
- Post stats update

# Evening
- Share first winner
- Engage with community
```

### Days 2-7
- Post daily stats
- Highlight winners
- Run contests
- Fix bugs
- Gather feedback
- Iterate features

## 🔍 Troubleshooting

### Frontend won't start
```bash
# Clear cache
rm -rf .next node_modules
bun install
bun run dev
```

### Contract deployment fails
```bash
# Check you have ETH on Base
# Check private key is correct
# Verify RPC URL is correct
```

### Transactions failing
```bash
# Check gas price isn't too low
# Verify contract addresses are correct
# Check USDC approval amount
# Verify wallet has USDC balance
```

### VRF not fulfilling
```bash
# Check VRF subscription has LINK
# Verify contract is added as consumer
# Check callback gas limit is sufficient
# Monitor Chainlink logs
```

## 📝 Development Tips

### Hot Reload
- Frontend auto-reloads on file changes
- Contracts require `forge build` to recompile

### Testing Locally
- Use Hardhat or Anvil for local blockchain
- Fork Base Sepolia for realistic testing

### Debugging
- Use `forge test -vvv` for detailed traces
- Check Basescan for transaction details
- Use Vercel logs for frontend errors

### Gas Optimization
- Run `forge test --gas-report`
- Look for expensive operations
- Use `uint8` instead of `uint256` where possible
- Pack structs efficiently

## 🎮 Demo Flow

**For investors/demos:**
1. Open app
2. Connect wallet (Coinbase Wallet recommended)
3. Create $1 challenge (open)
4. Accept from second device/wallet
5. Watch flip animation
6. Show instant payout
7. Display stats dashboard
8. Show Farcaster auto-cast
9. Explain free engagement features

**Talking points:**
- "10 seconds from challenge to payout"
- "Provably fair via Chainlink VRF"
- "Every game creates viral content on Farcaster"
- "Free daily flips keep users coming back"
- "Generating 10k+ Base transactions per day"

## 🤝 Contributing

We're not accepting external contributions yet, but we welcome feedback!

- Report bugs: GitHub Issues
- Suggest features: GitHub Discussions
- Security issues: Email security@flipbattle.xyz

## 📞 Support

- **Docs:** https://docs.flipbattle.xyz
- **Discord:** https://discord.gg/flipbattle
- **Email:** help@flipbattle.xyz
- **Farcaster:** /flipbattle

## 🎉 Ready to Flip!

You're all set! Start the dev server and begin building the future of social onchain gaming.

**Remember:** Test on Sepolia first, then deploy to mainnet when ready.

Good luck! 🪙
