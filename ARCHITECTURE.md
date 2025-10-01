# 🏗️ Flip Battle - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Farcaster   │  │  Web App     │  │  Mobile      │     │
│  │  Mini App    │  │  (Next.js)   │  │  (Future)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  WalletConnect  │
                    │     AppKit      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼──────┐  ┌────────▼────────┐  ┌────▼─────────┐
│  FlipBattle    │  │ StreakManager   │  │  Referral    │
│   Contract     │  │    Contract     │  │  Contract    │
└────────┬───────┘  └────────┬────────┘  └──────────────┘
         │                   │
         │          ┌────────▼────────┐
         └──────────►  Chainlink VRF  │
                    │   (Randomness)  │
                    └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Base Network  │
                    │     (Layer 2)   │
                    └─────────────────┘
```

## Smart Contract Layer

### FlipBattle.sol
**Purpose:** Core game logic, escrow, and payout system

**Key Functions:**
```solidity
// Challenge creation
function createChallenge(
    address opponent,    // target or address(0) for open
    uint256 betAmount,   // in USDC (6 decimals)
    uint8 call          // 0=heads, 1=tails
) external

// Challenge acceptance
function acceptChallenge(uint256 gameId) external

// VRF callback (automatic)
function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
) internal override

// Cancel expired challenge
function cancelChallenge(uint256 gameId) external
```

**State Management:**
- Games stored in mapping(uint256 => Game)
- User stats tracked (wins, losses, net profit)
- Fee collection (5% of pot)

**Security Features:**
- ReentrancyGuard on all payouts
- USDC approval required before betting
- Challenge expiration (24 hours)
- Owner-only fee withdrawal

### StreakManager.sol
**Purpose:** Daily check-in rewards and streak tracking

**Key Functions:**
```solidity
// Daily check-in (gas only)
function dailyCheckIn() external

// View streak and next reward
function getStreakData(address user) external view returns (
    uint256 currentStreak,
    uint256 lastCheckIn,
    uint256 nextRewardAt,
    uint256 freeFlipCredits
)

// Use free flip credits
function useCredits(address user, uint256 amount) external
```

**Reward Tiers:**
- Day 7: 3 free $1 flips ($3)
- Day 14: 10 free $1 flips ($10)
- Day 30: 20 free $1 flips ($20)
- Day 60: 50 free $1 flips ($50)

### ReferralSystem.sol
**Purpose:** Viral growth through referral incentives

**Key Functions:**
```solidity
// Register referral (called on signup)
function registerReferral(address referrer) external

// Claim referral earnings
function claimEarnings() external

// Get referral data
function getReferralData(address user) external view returns (
    address referrer,
    uint256 referralCount,
    uint256 totalEarnings,
    address[] referrals
)
```

**Incentive Structure:**
- Friend joins: $0.50 each
- Friend makes 5 flips: +$1 bonus
- Friend makes 20 flips: +$5 bonus

### DailyFreeFlip.sol
**Purpose:** Free daily lottery for engagement

**Key Functions:**
```solidity
// Claim daily flip (gas only)
function claimDailyFlip(uint8 call) external

// Fund prize pool (from flip fees)
function fundPrizePool() external payable

// View prize pool
function getPrizePoolData() external view returns (
    uint256 currentPool,
    uint256 participantsToday,
    address lastWinner,
    uint256 lastPrize
)
```

**Mechanics:**
- 10% of all flip fees go to prize pool
- 1 winner per day (random selection)
- Prize pool rolls over if no winner

## Frontend Architecture

### Technology Stack
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: TailwindCSS v4
Animations: Framer Motion
State Management: React hooks + Wagmi
Web3 Integration: viem + WalletConnect AppKit
```

### Page Structure
```
app/
├── page.tsx                    # Home - Create challenge
├── flip/
│   └── [id]/
│       └── page.tsx           # Game detail & accept
├── leaderboard/
│   └── page.tsx               # Stats & rankings
├── profile/
│   └── [address]/
│       └── page.tsx           # User profile
├── streak/
│   └── page.tsx               # Streak tracker
├── referral/
│   └── page.tsx               # Referral dashboard
└── api/
    ├── cast/
    │   └── route.ts           # Farcaster cast creation
    └── stats/
        └── route.ts           # Aggregate stats
```

### Key Components

**FlipGame Component:**
- Challenge creation form
- Bet amount selection ($0.50, $1, $2, $5)
- Heads/tails picker
- Opponent selector (username or open)
- USDC approval flow
- Transaction state handling

**CoinFlipAnimation Component:**
- 3D coin flip animation
- 2-3 second duration
- Shows result (heads/tails)
- Celebration effects on win

**GameCard Component:**
- Shows game state (waiting, flipping, completed)
- Player info (usernames, bet amounts)
- Accept button for pending challenges
- Result display with winner highlight

**StatsDisplay Component:**
- Win/loss record
- Win rate percentage
- Total profit/loss (in USDC)
- Longest win streak
- Recent games list

**StreakTracker Component:**
- Current streak counter
- Reward timeline/progress bar
- Next reward countdown
- Check-in button (gas only tx)

**ReferralDashboard Component:**
- Referral link with copy button
- Referral count & earnings
- List of referred users
- Share to Farcaster button

### State Management

**Game State Flow:**
```typescript
type GameState =
  | 'IDLE'              // No active game
  | 'CREATING'          // Creating challenge tx pending
  | 'WAITING'           // Challenge created, awaiting opponent
  | 'ACCEPTING'         // Opponent accepting
  | 'FLIPPING'          // VRF requested, waiting for result
  | 'COMPLETED'         // Game finished
  | 'CANCELLED'         // Challenge cancelled

// React state
const [gameState, setGameState] = useState<GameState>('IDLE');

// Contract event listeners
useWatchContractEvent({
  address: FLIP_BATTLE_ADDRESS,
  abi: FLIP_BATTLE_ABI,
  eventName: 'ChallengeCreated',
  onLogs(logs) {
    setGameState('WAITING');
  }
});

useWatchContractEvent({
  address: FLIP_BATTLE_ADDRESS,
  abi: FLIP_BATTLE_ABI,
  eventName: 'GameCompleted',
  onLogs(logs) {
    setGameState('COMPLETED');
    // Show result, update stats
  }
});
```

## WalletConnect Integration

### Configuration
```typescript
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from 'viem/chains'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

const metadata = {
  name: 'Flip Battle',
  description: '1v1 Coin Flip Betting',
  url: 'https://flipbattle.xyz',
  icons: ['https://flipbattle.xyz/icon.png']
}

const networks = [base, baseSepolia]

export const modal = createAppKit({
  adapters: [new WagmiAdapter({ networks, projectId })],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true, // Track usage for WalletConnect dashboard
  }
})
```

### Connection Flow
```
User clicks "Connect Wallet"
    ↓
WalletConnect modal opens
    ↓
User selects wallet (Coinbase Wallet, MetaMask, etc.)
    ↓
Wallet prompts for connection approval
    ↓
User approves
    ↓
Connected to Base network
    ↓
USDC balance fetched
    ↓
Ready to flip!
```

## Farcaster Integration

### Mini App Manifest
```json
{
  "name": "Flip Battle",
  "description": "1v1 coin flip betting on Base",
  "icon": "https://flipbattle.xyz/icon.png",
  "url": "https://flipbattle.xyz",
  "version": "1.0.0",
  "splash": {
    "image": "https://flipbattle.xyz/splash.png",
    "backgroundColor": "#0052FF"
  }
}
```

### Auto-Cast Flow

**Challenge Created:**
```typescript
async function createChallengeCast(gameData: GameData) {
  const cast = {
    text: `🪙 FLIP BATTLE 🪙\n\n${gameData.opponent ? `@${gameData.opponent}` : 'Open challenge'} - $${gameData.amount} flip!\nI call ${gameData.call === 0 ? 'HEADS 👑' : 'TAILS 🦅'}\n\nflipbattle.xyz/flip/${gameData.id}`,
    embeds: [{
      url: `https://flipbattle.xyz/flip/${gameData.id}`
    }]
  };

  await postToFarcaster(cast);
}
```

**Game Completed:**
```typescript
async function createResultCast(result: GameResult) {
  const cast = {
    text: `${result.outcome === 0 ? '👑 HEADS' : '🦅 TAILS'} WINS!\n\n@${result.winner} just won $${result.payout} from @${result.loser}! 🎉\n\nChallenge them back? flipbattle.xyz`,
    embeds: [{
      url: 'https://flipbattle.xyz'
    }]
  };

  await postToFarcaster(cast);
}
```

## Chainlink VRF Integration

### Setup
```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract FlipBattle is VRFConsumerBaseV2 {
    // VRF Configuration for Base
    address vrfCoordinator = 0x...; // Base VRF Coordinator
    bytes32 keyHash = 0x...;        // Gas lane
    uint64 subscriptionId;          // VRF subscription ID
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // Request randomness
    function requestFlip(uint256 gameId) internal {
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        requestIdToGameId[requestId] = gameId;
    }

    // Callback from VRF
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 gameId = requestIdToGameId[requestId];
        Game storage game = games[gameId];

        // Get 0 or 1 from random number
        uint8 result = uint8(randomWords[0] % 2);
        game.result = result;

        // Determine winner
        address winner = result == game.player1Call
            ? game.player1
            : game.player2;

        // Pay out (5% fee)
        uint256 totalPot = game.betAmount * 2;
        uint256 feeAmount = (totalPot * 5) / 100;
        uint256 winnerAmount = totalPot - feeAmount;

        USDC.transfer(winner, winnerAmount);
        collectedFees += feeAmount;

        emit GameCompleted(gameId, winner, result, winnerAmount);
    }
}
```

### VRF Subscription Management
- Create subscription on Chainlink VRF dashboard
- Fund with LINK tokens
- Add FlipBattle contract as consumer
- Monitor LINK balance (auto-refill if < 10 LINK)

## Database Schema (Optional - PostgreSQL)

### Tables

**users:**
```sql
CREATE TABLE users (
    address VARCHAR(42) PRIMARY KEY,
    farcaster_username VARCHAR(255),
    farcaster_fid INTEGER,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    net_profit DECIMAL(18, 6) DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    referrer VARCHAR(42),
    referral_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_net_profit ON users(net_profit DESC);
CREATE INDEX idx_users_referrer ON users(referrer);
```

**games:**
```sql
CREATE TABLE games (
    id BIGINT PRIMARY KEY,
    player1 VARCHAR(42) NOT NULL,
    player2 VARCHAR(42),
    bet_amount DECIMAL(18, 6) NOT NULL,
    player1_call SMALLINT NOT NULL,
    result SMALLINT,
    winner VARCHAR(42),
    state VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    tx_hash VARCHAR(66) NOT NULL
);

CREATE INDEX idx_games_player1 ON games(player1);
CREATE INDEX idx_games_player2 ON games(player2);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
```

**streaks:**
```sql
CREATE TABLE streaks (
    address VARCHAR(42) PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    last_check_in TIMESTAMP,
    free_flip_credits DECIMAL(18, 6) DEFAULT 0,
    total_check_ins INTEGER DEFAULT 0
);
```

**referrals:**
```sql
CREATE TABLE referrals (
    referee VARCHAR(42) PRIMARY KEY,
    referrer VARCHAR(42) NOT NULL,
    referee_flips INTEGER DEFAULT 0,
    referrer_earnings DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer);
```

## API Endpoints

### Game Stats
```typescript
// GET /api/stats
{
  totalGames: 1234,
  totalVolume: "12345.67", // USDC
  totalPlayers: 567,
  activePlayers24h: 89,
  flipsLast24h: 234
}
```

### Leaderboard
```typescript
// GET /api/leaderboard?type=profit&limit=50
[
  {
    address: "0x123...",
    farcasterUsername: "alice",
    wins: 45,
    losses: 32,
    netProfit: "123.45",
    winRate: 58.4
  },
  // ...
]
```

### User Profile
```typescript
// GET /api/profile/0x123...
{
  address: "0x123...",
  farcasterUsername: "alice",
  totalWins: 45,
  totalLosses: 32,
  netProfit: "123.45",
  winRate: 58.4,
  currentStreak: 7,
  longestStreak: 12,
  referralCount: 5,
  recentGames: [...]
}
```

## Performance Optimizations

### Frontend
- Server-side rendering (Next.js)
- Image optimization (next/image)
- Code splitting (dynamic imports)
- CDN caching (Vercel Edge)
- Service worker for offline

### Smart Contracts
- Minimal storage reads
- Batch operations where possible
- Gas-optimized data structures
- Event emissions for indexing

### Database
- Indexed queries
- Connection pooling
- Query result caching (Redis)
- Read replicas for analytics

## Monitoring & Analytics

### Contract Events
```solidity
event ChallengeCreated(uint256 indexed gameId, address indexed player1, address player2, uint256 amount);
event ChallengeAccepted(uint256 indexed gameId, address indexed player2);
event GameCompleted(uint256 indexed gameId, address indexed winner, uint8 result, uint256 payout);
event FlipRequested(uint256 indexed gameId, uint256 vrfRequestId);
event StreakIncremented(address indexed user, uint256 newStreak);
event ReferralRegistered(address indexed referee, address indexed referrer);
```

### Metrics to Track
- **Transaction Volume:** Daily/weekly USDC volume
- **User Growth:** New users, DAU, WAU, MAU
- **Engagement:** Flips per user, session duration
- **Retention:** D1, D7, D30 retention rates
- **Viral Coefficient:** Referrals per user
- **Revenue:** Daily/weekly fee collection

### Monitoring Tools
- Basescan for transaction monitoring
- Grafana for metrics visualization
- Sentry for error tracking
- PostHog for user analytics
- Vercel Analytics for web vitals

## Security Considerations

### Smart Contract Security
- ✅ ReentrancyGuard on all transfers
- ✅ Check-Effects-Interactions pattern
- ✅ Input validation on all functions
- ✅ Emergency pause mechanism
- ✅ Rate limiting on free features
- ✅ Access control (Ownable)

### Frontend Security
- ✅ Transaction simulation before signing
- ✅ USDC approval amount validation
- ✅ XSS prevention (sanitize inputs)
- ✅ CSRF protection (API routes)
- ✅ Rate limiting (API endpoints)

### Operational Security
- ✅ Multisig wallet for contract ownership
- ✅ Time-locked upgrades (if upgradeable)
- ✅ Bug bounty program
- ✅ Regular security audits
- ✅ Incident response plan

## Deployment Checklist

### Pre-Deploy
- [ ] All tests passing (100% coverage)
- [ ] Gas optimization review
- [ ] Security audit completed
- [ ] Testnet deployment successful
- [ ] Frontend tested on testnet
- [ ] Monitoring/alerts configured

### Deploy
- [ ] Deploy contracts to Base Mainnet
- [ ] Verify contracts on Basescan
- [ ] Set up Chainlink VRF subscription
- [ ] Fund VRF subscription with LINK
- [ ] Configure contract parameters
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Test full user flow on mainnet

### Post-Deploy
- [ ] Monitor first transactions
- [ ] Verify event emissions
- [ ] Check analytics tracking
- [ ] Test auto-cast functionality
- [ ] Run load tests
- [ ] Set up support channels

---

This architecture is designed for:
- ⚡ **Speed:** Fast transactions on Base L2
- 🔒 **Security:** Multiple layers of protection
- 📈 **Scalability:** Can handle 10k+ DAU
- 🎯 **Simplicity:** Easy to understand and maintain
- 💰 **Profitability:** 5% fee on all games
