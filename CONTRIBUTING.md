# Contributing to Flip Battle

Thank you for your interest in contributing to Flip Battle! This document provides guidelines and instructions for contributing to this provably fair coin flip betting game on Base.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Workflow](#contributing-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Security](#security)
- [Community](#community)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive in all interactions
- Provide constructive feedback and accept it gracefully
- Focus on what's best for the gaming community
- Show empathy towards other contributors and players

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Foundry** (for Solidity development)
- **MetaMask** or similar Web3 wallet
- **Base Sepolia testnet ETH** (for testing)
- **USDC on Base Sepolia** (for game testing)

### Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/flip-battle.git
   cd flip-battle
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development Setup

### Smart Contract Development

Flip Battle uses Solidity for its on-chain game logic:

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Farcaster Mini App Development

For Farcaster Mini App features:

1. **Install Farcaster SDK**:
   ```bash
   npm install @farcaster/frame-sdk
   ```

2. **Test in Farcaster environment**:
   - Use [Warpcast](https://warpcast.com) for testing
   - Follow [Farcaster Mini App docs](https://docs.farcaster.xyz/developers/frames/)

## Project Structure

```
flip-battle/
├── contracts/          # Solidity smart contracts
│   ├── FlipBattle.sol       # Core game logic
│   ├── ReferralSystem.sol   # Referral rewards
│   └── StreakTracker.sol    # Win streak tracking
├── src/               # Frontend source code
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── contexts/      # React contexts
│   └── utils/         # Utility functions
├── test/              # Test files
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── scripts/           # Deployment and utility scripts
└── docs/              # Documentation
```

## Contributing Workflow

### 1. Create an Issue

Before starting work:

- Check existing issues to avoid duplicates
- Create a new issue describing your proposed change
- Wait for maintainer feedback on significant changes

### 2. Branch Naming

Create branches with descriptive names:

```
feature/add-tournament-mode
fix/quantum-randomness-bug
docs/update-farcaster-guide
refactor/optimize-gas-usage
```

### 3. Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(contracts): add tournament mode with entry fees

Implement tournament mode allowing players to compete
in scheduled events with prize pools.

Closes #123
```

### 4. Pull Request Process

1. **Ensure tests pass**:
   ```bash
   forge test
   npm test
   ```

2. **Update documentation** if needed

3. **Create PR** with:
   - Clear title and description
   - Reference to related issue(s)
   - Screenshots (for UI changes)
   - Test results

4. **Address review feedback** promptly

5. **Wait for approval** from at least one maintainer

## Coding Standards

### Solidity

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use `solhint` for linting
- Document all public functions with NatSpec
- Include comprehensive inline comments for complex logic

```solidity
/**
 * @notice Creates a new coin flip game
 * @param betAmount Amount of USDC to bet
 * @param playerChoice Player's choice (0 = heads, 1 = tails)
 * @return gameId The unique game ID
 */
function createGame(
    uint256 betAmount,
    uint8 playerChoice
) external returns (uint256 gameId) {
    // Implementation
}
```

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use functional components with hooks
- Document complex functions with JSDoc

```typescript
/**
 * Initiates a coin flip game
 * @param amount - Bet amount in USDC
 * @param choice - Player's choice (0 = heads, 1 = tails)
 * @returns Promise resolving to game result
 */
async function flipCoin(
  amount: number,
  choice: 0 | 1
): Promise<GameResult> {
  // Implementation
}
```

## Testing

### Unit Tests

Write comprehensive unit tests for all contracts:

```solidity
function test_CreateGame_Success() public {
    // Arrange
    uint256 betAmount = 100 * 10**6; // 100 USDC
    uint8 playerChoice = 0; // Heads
    
    // Act
    uint256 gameId = flipBattle.createGame(betAmount, playerChoice);
    
    // Assert
    assertEq(flipBattle.getGameBet(gameId), betAmount);
}
```

### Integration Tests

Test cross-contract interactions:

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test test_CreateGame
```

### Frontend Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to: security@flipbattle.xyz
2. Include detailed description and reproduction steps
3. Allow 48 hours for initial response
4. Coordinate disclosure timeline

### Security Best Practices

When contributing:

- **Never commit private keys** or sensitive data
- **Use environment variables** for configuration
- **Validate all inputs** in smart contracts
- **Follow checks-effects-interactions** pattern
- **Use reentrancy guards** where appropriate
- **Get security review** for significant changes

### Provably Fair Gaming

- Ensure randomness sources are cryptographically secure
- Verify commitment schemes are properly implemented
- Test edge cases in game logic
- Document fairness mechanisms clearly

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: [Join our community](https://discord.gg/flipbattle)
- **Farcaster**: [@flipbattle](https://warpcast.com/flipbattle)
- **Twitter**: [@FlipBattleBase](https://twitter.com/FlipBattleBase)

### Getting Help

- Check [documentation](https://docs.flipbattle.xyz)
- Search existing issues
- Ask in Discord #dev-help channel
- Tag maintainers in PRs if stuck

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for referral rewards
- Considered for core team roles

## Bounty Program

We offer bounties for:

- **Critical security bugs**: $5,000 - $10,000
- **High impact features**: $1,000 - $5,000
- **Mini App improvements**: $500 - $2,000
- **Documentation improvements**: $100 - $500
- **UI/UX enhancements**: $100 - $500

Check [active bounties](https://github.com/adrians12345/flip-battle/issues?q=is%3Aopen+label%3Abounty) for opportunities.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping build the future of provably fair gaming on Base! 🪙🚀