# Flip Battle - Frontend

Provably fair coin flip betting on Base with Chainlink VRF, built with Next.js 15 and React 19.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.2+
- WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
- (Optional) Neynar API key from [neynar.com](https://neynar.com)

### Installation

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your values
```

### Environment Variables

Create `.env.local` with:

```bash
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_key

# Network (testnet or mainnet)
NEXT_PUBLIC_NETWORK=testnet

# Contract Addresses (update after deployment)
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...
```

### Development

```bash
# Run dev server (Turbopack enabled)
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── components/          # React components
│   │   ├── FlipGame.tsx           # Main game interface
│   │   ├── CoinFlipAnimation.tsx  # 3D coin flip animation
│   │   ├── GameCard.tsx           # Game state display
│   │   ├── StatsDisplay.tsx       # User statistics
│   │   ├── StreakTracker.tsx      # Daily streak management
│   │   ├── ReferralDashboard.tsx  # Referral system
│   │   ├── DailyFreeFlip.tsx      # Free daily flip
│   │   ├── FarcasterProfile.tsx   # Farcaster integration
│   │   ├── ShareButton.tsx        # Social sharing
│   │   ├── AutoCast.tsx           # Auto-posting to Farcaster
│   │   ├── LiveEventFeed.tsx      # Real-time event stream
│   │   ├── ConnectButton.tsx      # Wallet connection
│   │   └── Web3Provider.tsx       # Web3 context provider
│   ├── hooks/               # Custom React hooks
│   │   ├── useFlipBattle.ts       # FlipBattle contract
│   │   ├── useStreakManager.ts    # Streak contract
│   │   ├── useReferralSystem.ts   # Referral contract
│   │   ├── useDailyFreeFlip.ts    # Daily flip contract
│   │   └── useContractEvents.ts   # Event listeners
│   ├── lib/                 # Utilities and config
│   │   ├── contracts.ts           # Contract addresses & ABIs
│   │   ├── web3.ts                # wagmi configuration
│   │   └── neynar.ts              # Farcaster API helpers
│   ├── games/               # Games list page
│   ├── profile/             # User profile page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── public/
│   └── .well-known/
│       └── farcaster.json   # Farcaster mini app manifest
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # TailwindCSS configuration
└── package.json
```

## 🎨 Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.1
- **Styling**: TailwindCSS 4.1.13
- **Animations**: Framer Motion 12.23.22
- **Web3**: wagmi 2.17.5 + viem 2.37.9
- **Wallet**: Reown AppKit 1.8.8 (WalletConnect)
- **Farcaster**: Neynar SDK 3.34.0

## 🎮 Features

### Core Gameplay
- **Create Challenges**: Bet USDC and challenge any address
- **Accept Challenges**: Accept pending challenges
- **Coin Flip Animation**: Smooth 3D flip with particle effects
- **Provably Fair**: All randomness from Chainlink VRF

### Engagement Features
- **Daily Streaks**: Check in daily, earn USDC at milestones
- **Referrals**: Earn 5% of referral bets + 1 USDC signup bonus
- **Daily Free Flip**: Free flip every 24 hours, funded by fees
- **Statistics**: Track wins, losses, profit, and win rate

### Social Features
- **Farcaster Profiles**: Display usernames and avatars
- **Share to Warpcast**: One-click sharing of results
- **Auto-Cast**: Automatic notifications for events
- **Live Event Feed**: Real-time activity stream

### UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: Beautiful dark theme with gradients
- **Loading States**: Skeletons and spinners
- **Empty States**: Helpful messaging when no data
- **Toast Notifications**: Real-time event notifications

## 🔗 Smart Contract Integration

The frontend integrates with 4 smart contracts:

1. **FlipBattle**: Core coin flip betting logic
2. **StreakManager**: Daily check-ins and rewards
3. **ReferralSystem**: Referral tracking and earnings
4. **DailyFreeFlip**: Free daily flip lottery

All contracts use Chainlink VRF for provably fair randomness.

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

Works with any platform supporting Next.js:
- Netlify
- Cloudflare Pages
- Railway
- Self-hosted

## 🔧 Configuration

### Network Selection

Toggle between testnet and mainnet in `.env.local`:

```bash
# For Base Sepolia (testnet)
NEXT_PUBLIC_NETWORK=testnet

# For Base Mainnet (production)
NEXT_PUBLIC_NETWORK=mainnet
```

### Contract Addresses

Update contract addresses after deployment:

```bash
# Base Sepolia
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...
```

## 📊 Performance

- **First Load JS**: ~640 KB (shared bundles optimized)
- **Route-specific JS**: 1.8-4.7 KB per page
- **Build Time**: ~18 seconds
- **Hot Reload**: <100ms with Turbopack

## 🐛 Known Issues

- **indexedDB warnings during SSR**: Expected behavior, doesn't affect production
- **Neynar SDK**: Placeholder implementation, needs production API calls
- **Turbopack warning**: Config property deprecated, safe to ignore

## 🤝 Contributing

This is a monorepo project. The frontend lives in `apps/web/`.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Website**: https://flipbattle.xyz
- **Contracts**: See `../../contracts/`
- **Base Network**: https://base.org
- **Chainlink VRF**: https://docs.chain.link/vrf
