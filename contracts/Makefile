.PHONY: help build test clean deploy-sepolia deploy-mainnet deploy-local verify-all

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all contracts
	forge build

test: ## Run all tests
	forge test -vv

test-gas: ## Run tests with gas report
	forge test --gas-report

test-coverage: ## Generate test coverage report
	forge coverage

clean: ## Clean build artifacts
	forge clean

# Local deployment
deploy-local: ## Deploy to local Anvil (run 'anvil' first)
	forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast -vvvv

# Testnet deployment
deploy-sepolia: ## Deploy to Base Sepolia testnet
	@echo "Deploying to Base Sepolia..."
	@forge script script/Deploy.s.sol \
		--rpc-url base-sepolia \
		--broadcast \
		--verify \
		-vvvv

deploy-sepolia-no-verify: ## Deploy to Base Sepolia without verification
	@echo "Deploying to Base Sepolia (no verification)..."
	@forge script script/Deploy.s.sol \
		--rpc-url base-sepolia \
		--broadcast \
		-vvvv

# Mainnet deployment
deploy-mainnet: ## Deploy to Base Mainnet (⚠️ USE WITH CAUTION)
	@echo "⚠️  DEPLOYING TO BASE MAINNET ⚠️"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@forge script script/Deploy.s.sol \
		--rpc-url base-mainnet \
		--broadcast \
		--verify \
		-vvvv

# Verification
verify-all: ## Verify all contracts on Basescan (set addresses in .env first)
	@echo "Verifying contracts..."
	@echo "Note: Set contract addresses in .env before running"
	@forge verify-contract $(FLIP_BATTLE_ADDRESS) FlipBattle --chain-id 84532
	@forge verify-contract $(STREAK_MANAGER_ADDRESS) StreakManager --chain-id 84532
	@forge verify-contract $(REFERRAL_SYSTEM_ADDRESS) ReferralSystem --chain-id 84532
	@forge verify-contract $(DAILY_FREE_FLIP_ADDRESS) DailyFreeFlip --chain-id 84532

# Utilities
anvil: ## Start local Anvil node
	anvil

format: ## Format code with forge fmt
	forge fmt

lint: ## Check code formatting
	forge fmt --check

snapshot: ## Create gas snapshot
	forge snapshot

# Chain info
sepolia-info: ## Show Base Sepolia network info
	@echo "Base Sepolia Network Info:"
	@echo "Chain ID: 84532"
	@echo "RPC: https://sepolia.base.org"
	@echo "Explorer: https://sepolia.basescan.org"
	@echo "VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"
	@echo "USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e"
	@echo "Faucets:"
	@echo "  ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
	@echo "  USDC: https://faucet.circle.com"

mainnet-info: ## Show Base Mainnet network info
	@echo "Base Mainnet Network Info:"
	@echo "Chain ID: 8453"
	@echo "RPC: https://mainnet.base.org"
	@echo "Explorer: https://basescan.org"
	@echo "VRF Coordinator: 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634"
	@echo "USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
