# Flip Battle - Quick Start Guide

## Smart Contracts Summary

Four production-ready contracts with 70 passing tests:

1. **FlipBattle.sol** - Core coin flip betting with Chainlink VRF
2. **StreakManager.sol** - Daily check-ins with milestone rewards
3. **ReferralSystem.sol** - Viral referral system with bonuses
4. **DailyFreeFlip.sol** - Daily free lottery with VRF

## Local Development

### 1. Build contracts:
```bash
cd contracts
forge build
```

### 2. Run tests:
```bash
forge test
```

### 3. Run tests with gas report:
```bash
forge test --gas-report
```

## Deployment

### Option 1: Using Makefile (Recommended)

```bash
# Show available commands
make help

# Build contracts
make build

# Run tests
make test

# Deploy to Base Sepolia testnet
make deploy-sepolia

# Deploy to Base Mainnet (⚠️ use with caution)
make deploy-mainnet
```

### Option 2: Using Forge Directly

```bash
# Base Sepolia
forge script script/Deploy.s.sol --rpc-url base-sepolia --broadcast --verify

# Base Mainnet
forge script script/Deploy.s.sol --rpc-url base-mainnet --broadcast --verify
```

## Prerequisites

Before deploying:

1. **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

2. **Fill in `.env` with**:
- Your private key (without 0x prefix)
- VRF Subscription ID (create at https://vrf.chain.link)
- Basescan API key (for verification)

3. **Fund your wallet**:
- Base Sepolia: Get ETH from https://www.coinbase.com/faucets
- Base Sepolia: Get USDC from https://faucet.circle.com

## Post-Deployment

After deploying, you must:

1. **Add VRF Consumers** at https://vrf.chain.link:
   - Add FlipBattle contract address
   - Add DailyFreeFlip contract address

2. **Fund Reward Contracts** with USDC:
   - StreakManager: $1000+ for streak rewards
   - ReferralSystem: $500+ for referral bonuses
   - DailyFreeFlip: $100+ for daily prizes

3. **Update Frontend** with contract addresses

## Full Documentation

- **Deployment Guide**: See `DEPLOYMENT.md` for complete instructions
- **Architecture**: See `ARCHITECTURE.md` for system design
- **Testing**: See `TEST.md` for testing guide

## Network Information

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE

### Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org
- VRF Coordinator: 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634

## Quick Commands

```bash
# Build
make build

# Test
make test

# Test with coverage
make test-coverage

# Deploy to testnet
make deploy-sepolia

# Show network info
make sepolia-info
make mainnet-info
```

## Support

Issues? Check:
- Build logs: Run with `-vvvv` flag
- Test failures: Run `forge test -vvv`
- Deployment issues: See `DEPLOYMENT.md` troubleshooting section
