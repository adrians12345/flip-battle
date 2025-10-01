'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { getContracts, ABIS } from '@/lib/contracts';

export function useReferralSystem() {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Register with a referrer
  const registerWithReferrer = async (referrer: Address) => {
    return writeContract({
      address: contracts.referralSystem,
      abi: ABIS.referralSystem,
      functionName: 'registerWithReferrer',
      args: [referrer],
    });
  };

  // Claim referral earnings
  const claimEarnings = async () => {
    return writeContract({
      address: contracts.referralSystem,
      abi: ABIS.referralSystem,
      functionName: 'claimEarnings',
    });
  };

  return {
    registerWithReferrer,
    claimEarnings,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to read user's referrer
export function useReferrer(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    functionName: 'referrers',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { referrer: data as Address | undefined, isLoading, error };
}

// Hook to read referral earnings
export function useReferralEarnings(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    functionName: 'referralEarnings',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { earnings: data as bigint | undefined, isLoading, error, refetch };
}

// Hook to read referral count
export function useReferralCount(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    functionName: 'referralCount',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { count: data as bigint | undefined, isLoading, error, refetch };
}

// Hook to read all referrals for a user
export function useReferrals(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    functionName: 'getReferrals',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { referrals: data as Address[] | undefined, isLoading, error, refetch };
}

// Hook to read if user is registered
export function useIsRegistered(userAddress: Address | undefined) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  const { data, isLoading, error } = useReadContract({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    functionName: 'isRegistered',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return { isRegistered: data as boolean | undefined, isLoading, error };
}
