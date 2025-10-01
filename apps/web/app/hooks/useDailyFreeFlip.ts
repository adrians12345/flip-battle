'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { getContracts, ABIS } from '@/lib/contracts';

export function useDailyFreeFlip() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Enter daily free flip
  const enterDailyFlip = async (chooseHeads: boolean) => {
    return writeContract({
      address: contracts.dailyFreeFlip,
      abi: ABIS.dailyFreeFlip,
      functionName: 'enterDailyFlip',
      args: [chooseHeads],
    });
  };

  // Claim daily free flip winnings
  const claimWinnings = async (flipId: bigint) => {
    return writeContract({
      address: contracts.dailyFreeFlip,
      abi: ABIS.dailyFreeFlip,
      functionName: 'claimWinnings',
      args: [flipId],
    });
  };

  return {
    enterDailyFlip,
    claimWinnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to check if user can play today
export function useCanPlayToday(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    functionName: 'canPlayToday',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { canPlay: data as boolean | undefined, isLoading, error, refetch };
}

// Hook to read current prize pool
export function usePrizePool() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    functionName: 'prizePool',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return { prizePool: data as bigint | undefined, isLoading, error, refetch };
}

// Hook to read prize amount
export function usePrizeAmount() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    functionName: 'prizeAmount',
  });

  return { prizeAmount: data as bigint | undefined, isLoading, error };
}

// Hook to read user's daily flip details
export function useUserDailyFlip(userAddress: Address | undefined, flipId: bigint | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    functionName: 'dailyFlips',
    args: userAddress && flipId !== undefined ? [userAddress, flipId] : undefined,
    query: {
      enabled: !!userAddress && flipId !== undefined,
    },
  });

  return { flip: data, isLoading, error };
}

// Hook to read total flips today
export function useFlipsToday() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    functionName: 'flipsToday',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return { flipsToday: data as bigint | undefined, isLoading, error, refetch };
}
