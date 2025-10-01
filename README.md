# 🪙 Flip Battle

**Provably Fair Coin Flip Betting on Base**

Challenge anyone to a coin flip duel. Bet USDC, earn rewards, build streaks. All powered by Chainlink VRF on Base network.

---

## 🎯 Project Status

**Current Version**: v0.1.0 (Testnet Ready)
**Phase**: 15/17 Complete (87%)
**Build Status**: ✅ Passing
**Test Coverage**: 70/70 tests passing

**Ready for**: Base Sepolia deployment
**Next**: Testnet testing → Mainnet deployment

---

## ✨ Features

### Core Features
- 🎲 **Coin Flip Betting** - Challenge any address, 1+ USDC bets, provably fair
- 🔥 **Daily Streaks** - Check in daily, earn up to 150 USDC at milestones
- 👥 **Referral System** - 1 USDC signup bonus + 5% of all referral bets
- 🎁 **Daily Free Flip** - Free flip every 24 hours, funded by platform fees

### Engagement
- 📊 **Statistics** - Track games, wins, profit, win rate
- 🏆 **Achievements** - 6 achievement tiers to unlock
- 🔔 **Live Events** - Real-time event feed and notifications
- 🎭 **Farcaster** - Profile display, sharing, auto-cast

### Technical
- ⚡ **Fast** - ~30-60s VRF fulfillment
- 🔒 **Secure** - OpenZeppelin security standards
- 💰 **Fair** - 95% payout, 5% platform fee
- 📱 **Mobile** - Fully responsive design

---

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity** 0.8.28
- **Foundry** (forge, cast, anvil)
- **Chainlink VRF** v2.5 (provable randomness)
- **OpenZeppelin** (security standards)
- **Base Network** (Ethereum L2)

### Frontend
- **Next.js** 15.5.4 (App Router)
- **React** 19.1.1
- **TypeScript** 5.9.3 (strict mode)
- **TailwindCSS** 4.1.13
- **Framer Motion** 12.23.22
- **wagmi** 2.17.5 + **viem** 2.37.9
- **Reown AppKit** 1.8.8 (WalletConnect)
- **Neynar SDK** 3.34.0 (Farcaster)

### Infrastructure
- **Turborepo** 2.5.8 (monorepo)
- **Vercel** (deployment)
- **BaseScan** (verification)

---

## 📁 Project Structure

```
flip-battle/
├── contracts/                    # Smart contracts (Foundry)
│   ├── src/                      # Contract source files
│   │   ├── FlipBattle.sol        # Core betting logic
│   │   ├── StreakManager.sol     # Daily streaks
│   │   ├── ReferralSystem.sol    # Referral tracking
│   │   └── DailyFreeFlip.sol     # Free daily flip
│   ├── test/                     # 70 tests (all passing)
│   ├── script/                   # Deployment scripts
│   │   ├── Deploy.s.sol          # Main deployment
│   │   └── DeployLocal.s.sol     # Local testing
│   ├── deploy-sepolia.sh         # Interactive deployment
│   ├── test-contracts.sh         # Contract testing tool
│   └── foundry.toml              # Foundry config
│
├── apps/web/                     # Next.js frontend
│   ├── app/
│   │   ├── components/           # 13 React components
│   │   ├── hooks/                # 28 custom hooks
│   │   ├── lib/                  # Config & utilities
│   │   ├── games/                # Games list page
│   │   ├── profile/              # Profile page
│   │   └── page.tsx              # Home page
│   ├── public/
│   │   └── .well-known/
│   │       └── farcaster.json    # Mini app manifest
│   └── package.json
│
├── DEPLOYMENT_CHECKLIST.md       # Step-by-step deployment
├── VERCEL_DEPLOYMENT.md          # Vercel-specific guide
├── TESTING_GUIDE.md              # Test scenarios
├── TEST_USDC_GUIDE.md            # Get testnet USDC
├── PROJECT_STATUS.md             # Current status
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.2+
- **Foundry** (for contracts)
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/flip-battle.git
cd flip-battle

# Install dependencies
bun install

# Build everything
bun run build
```

### Local Development

**Frontend**:
```bash
cd apps/web
bun run dev
# Open http://localhost:3000
```

**Contracts**:
```bash
cd contracts

# Run tests
forge test

# Local deployment (Anvil)
make deploy-local
```

---

## 📦 Deployment

### Base Sepolia Testnet

**See**: `DEPLOYMENT_CHECKLIST.md` for complete step-by-step guide

**Quick version**:

1. **Get Prerequisites**:
   - Base Sepolia ETH (0.1+ ETH)
   - VRF subscription (2+ LINK)
   - BaseScan API key
   - WalletConnect Project ID

2. **Deploy Contracts**:
   ```bash
   cd contracts
   ./deploy-sepolia.sh
   ```

3. **Add VRF Consumers** at https://vrf.chain.link

4. **Update Vercel Env Vars** with contract addresses

5. **Deploy Frontend**:
   ```bash
   cd apps/web
   vercel --prod
   ```

6. **Test Everything** - See `TESTING_GUIDE.md`

---

## 📊 Smart Contracts

### FlipBattle.sol
Core coin flip betting contract with Chainlink VRF integration.

**Key Functions**:
- `createFlip(opponent, amount, choice)` - Create challenge
- `acceptFlip(gameId)` - Accept challenge
- `cancelFlip(gameId)` - Cancel before acceptance
- `claimWinnings(gameId)` - Claim prize after win

**Events**:
- `FlipCreated`, `FlipAccepted`, `FlipResolved`, `FlipCancelled`

### StreakManager.sol
Daily check-in system with milestone rewards.

**Milestones**:
- Day 7: 5 USDC
- Day 14: 12 USDC
- Day 30: 30 USDC
- Day 60: 75 USDC
- Day 90: 150 USDC

### ReferralSystem.sol
Referral tracking and earnings.

**Rewards**:
- 1 USDC signup bonus
- 5% of all referral bets

### DailyFreeFlip.sol
Free daily flip lottery funded by platform fees.

**Details**:
- Free entry (only gas)
- 2% of platform fees go to prize pool
- One play per 24 hours

---

## 🧪 Testing

### Smart Contracts

```bash
cd contracts

# Run all tests
forge test

# With gas report
forge test --gas-report

# Specific test
forge test --match-test testCreateFlip -vvv
```

**Status**: 70/70 tests passing ✅

### Frontend

```bash
cd apps/web

# Build
bun run build

# Type check
bun run type-check

# Lint
bun run lint
```

**Status**: Build passing ✅

---

## 📖 Documentation

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment guide
- **[VERCEL_DEPLOYMENT.md](./contracts/VERCEL_DEPLOYMENT.md)** - Vercel-specific deployment
- **[TESTING_GUIDE.md](./contracts/TESTING_GUIDE.md)** - Test scenarios
- **[TEST_USDC_GUIDE.md](./TEST_USDC_GUIDE.md)** - Get testnet USDC
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status
- **[Frontend README](./apps/web/README.md)** - Frontend documentation

---

## 🎮 How to Play

1. **Connect Wallet** via WalletConnect
2. **Get USDC** (testnet or mainnet)
3. **Create Challenge**:
   - Enter opponent address
   - Choose bet amount (1+ USDC)
   - Select Heads or Tails
4. **Wait for Acceptance** or accept pending challenges
5. **Coin Flip** - Chainlink VRF determines winner in ~60s
6. **Winner Claims** - 95% of pot goes to winner

**Bonus Features**:
- Daily check-ins for streak rewards
- Refer friends for bonuses
- Free daily flip lottery

---

## 🎯 Roadmap

### ✅ Phase 1-15 Complete (87%)
- Smart contract development
- Frontend development
- Testing & documentation
- Deployment scripts

### 🚧 Current: Phase 16-17
- Testnet deployment
- Testing & bug fixes
- Mainnet preparation
- Launch! 🚀

### 🔮 Future Features
- Multiplayer tournaments
- NFT rewards for achievements
- DAO governance
- Mobile app

---

## 💰 Economics

### Platform Fees
- **5%** of all flip bets
- **2%** to daily free flip prize pool
- **3%** to operations and rewards

### Reward Pools
- **Streaks**: Pre-funded reward pool
- **Referrals**: Paid from platform fees
- **Daily Free Flip**: Funded by 2% of fees

---

## 🔒 Security

- **OpenZeppelin** contracts for security standards
- **Chainlink VRF** for provable randomness
- **ReentrancyGuard** on all state-changing functions
- **70 unit tests** covering all functionality
- **Recommended**: Security audit before mainnet

---

## 📞 Support & Links

### Documentation
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- [Testing Guide](./contracts/TESTING_GUIDE.md)
- [Project Status](./PROJECT_STATUS.md)

### External Resources
- **Base Docs**: https://docs.base.org
- **Chainlink VRF**: https://docs.chain.link/vrf
- **Base Discord**: https://discord.gg/buildonbase
- **WalletConnect**: https://docs.walletconnect.com

### Quick Commands
```bash
# Deploy contracts
cd contracts && ./deploy-sepolia.sh

# Test contracts
cd contracts && forge test

# Build frontend
cd apps/web && bun run build

# Deploy frontend
vercel --prod
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `forge test` and `bun run build`
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🎉 Acknowledgments

Built with:
- **Base** - Ethereum L2 network
- **Chainlink** - VRF randomness
- **WalletConnect** - Wallet connections
- **Farcaster** - Social integration
- **Vercel** - Hosting platform

---

**Ready to flip?** 🪙

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) to get started!
