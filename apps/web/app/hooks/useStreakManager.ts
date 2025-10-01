'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { getContracts, ABIS } from '@/lib/contracts';

export function useStreakManager() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check in to maintain streak
  const checkIn = async () => {
    return writeContract({
      address: contracts.streakManager,
      abi: ABIS.streakManager,
      functionName: 'checkIn',
    });
  };

  // Claim streak reward
  const claimReward = async (day: number) => {
    return writeContract({
      address: contracts.streakManager,
      abi: ABIS.streakManager,
      functionName: 'claimReward',
      args: [BigInt(day)],
    });
  };

  return {
    checkIn,
    claimReward,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to read user's current streak
export function useCurrentStreak(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    functionName: 'getCurrentStreak',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { streak: data as bigint | undefined, isLoading, error, refetch };
}

// Hook to read if user can check in today
export function useCanCheckIn(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    functionName: 'canCheckInToday',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { canCheckIn: data as boolean | undefined, isLoading, error, refetch };
}

// Hook to read available rewards
export function useAvailableRewards(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    functionName: 'getAvailableRewards',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    rewards: data ? {
      days: (data as any)[0] as bigint[],
      amounts: (data as any)[1] as bigint[],
      claimed: (data as any)[2] as boolean[],
    } : undefined,
    isLoading,
    error,
    refetch,
  };
}

// Hook to read streak reward for a specific day
export function useStreakReward(day: number) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    functionName: 'streakRewards',
    args: [BigInt(day)],
  });

  return { reward: data as bigint | undefined, isLoading, error };
}
