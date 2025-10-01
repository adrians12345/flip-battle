'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseUnits } from 'viem';
import { getContracts, ABIS } from '@/lib/contracts';

export function useFlipBattle() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  // Write functions
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Create a new flip game
  const createFlip = async (opponent: Address, betAmount: string, chooseHeads: boolean) => {
    const amount = parseUnits(betAmount, 6); // USDC has 6 decimals
    return writeContract({
      address: contracts.flipBattle,
      abi: ABIS.flipBattle,
      functionName: 'createFlip',
      args: [opponent, amount, chooseHeads],
    });
  };

  // Accept a flip
  const acceptFlip = async (flipId: bigint) => {
    return writeContract({
      address: contracts.flipBattle,
      abi: ABIS.flipBattle,
      functionName: 'acceptFlip',
      args: [flipId],
    });
  };

  // Cancel a flip
  const cancelFlip = async (flipId: bigint) => {
    return writeContract({
      address: contracts.flipBattle,
      abi: ABIS.flipBattle,
      functionName: 'cancelFlip',
      args: [flipId],
    });
  };

  // Claim winnings
  const claimWinnings = async (flipId: bigint) => {
    return writeContract({
      address: contracts.flipBattle,
      abi: ABIS.flipBattle,
      functionName: 'claimWinnings',
      args: [flipId],
    });
  };

  return {
    createFlip,
    acceptFlip,
    cancelFlip,
    claimWinnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to read flip details
export function useFlipDetails(flipId: bigint | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    functionName: 'getFlipDetails',
    args: flipId !== undefined ? [flipId] : undefined,
    query: {
      enabled: flipId !== undefined,
    },
  });

  return { flip: data, isLoading, error };
}

// Hook to read user's active flips
export function useUserFlips(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    functionName: 'getUserFlips',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { flipIds: data as bigint[] | undefined, isLoading, error };
}

// Hook to read user's stats
export function useUserStats(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    functionName: 'getUserStats',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    stats: data ? {
      gamesPlayed: (data as any)[0],
      gamesWon: (data as any)[1],
      totalWagered: (data as any)[2],
      totalWinnings: (data as any)[3],
    } : undefined,
    isLoading,
    error,
  };
}

// Hook to read minimum bet
export function useMinimumBet() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    functionName: 'minimumBet',
  });

  return { minimumBet: data as bigint | undefined, isLoading, error };
}

// Hook to approve USDC spending
export function useApproveUSDC() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string) => {
    const value = parseUnits(amount, 6);
    return writeContract({
      address: contracts.usdc,
      abi: ABIS.erc20,
      functionName: 'approve',
      args: [contracts.flipBattle, value],
    });
  };

  return { approve, isPending, isConfirming, isSuccess, error, hash };
}

// Hook to read USDC allowance
export function useUSDCAllowance(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.usdc,
    abi: ABIS.erc20,
    functionName: 'allowance',
    args: userAddress ? [userAddress, contracts.flipBattle] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { allowance: data as bigint | undefined, isLoading, error, refetch };
}

// Hook to read USDC balance
export function useUSDCBalance(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.usdc,
    abi: ABIS.erc20,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { balance: data as bigint | undefined, isLoading, error, refetch };
}
