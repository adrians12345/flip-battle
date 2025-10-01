import { Address } from 'viem';
import FlipBattleABI from './abis/FlipBattle.json';
import StreakManagerABI from './abis/StreakManager.json';
import ReferralSystemABI from './abis/ReferralSystem.json';
import DailyFreeFlipABI from './abis/DailyFreeFlip.json';

// Contract addresses - update these after deployment
export const CONTRACTS = {
  // Base Sepolia (testnet)
  baseSepolia: {
    flipBattle: (process.env.NEXT_PUBLIC_FLIP_BATTLE_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    streakManager: (process.env.NEXT_PUBLIC_STREAK_MANAGER_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    referralSystem: (process.env.NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    dailyFreeFlip: (process.env.NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address, // Base Sepolia USDC
  },
  // Base Mainnet
  base: {
    flipBattle: (process.env.NEXT_PUBLIC_FLIP_BATTLE_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    streakManager: (process.env.NEXT_PUBLIC_STREAK_MANAGER_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    referralSystem: (process.env.NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    dailyFreeFlip: (process.env.NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS || '0x0000000000000000000000000000000000000000') as Address,
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address, // Base Mainnet USDC
  },
} as const;

// ABIs
export const ABIS = {
  flipBattle: FlipBattleABI,
  streakManager: StreakManagerABI,
  referralSystem: ReferralSystemABI,
  dailyFreeFlip: DailyFreeFlipABI,
  // Standard ERC20 ABI (minimal for USDC)
  erc20: [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { name: '_owner', type: 'address' },
        { name: '_spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { name: '_spender', type: 'address' },
        { name: '_value', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      type: 'function',
    },
  ],
} as const;

// Helper to get contracts for current network
export function getContracts(chainId: number) {
  if (chainId === 84532) {
    return CONTRACTS.baseSepolia;
  }
  if (chainId === 8453) {
    return CONTRACTS.base;
  }
  // Default to sepolia for development
  return CONTRACTS.baseSepolia;
}
