'use client';

import { useWatchContractEvent } from 'wagmi';
import { useAccount } from 'wagmi';
import { getContracts, ABIS } from '@/lib/contracts';

// Watch FlipBattle events
export function useWatchFlipCreated(onFlipCreated: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    eventName: 'FlipCreated',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipCreated(log.args));
    },
  });
}

export function useWatchFlipAccepted(onFlipAccepted: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    eventName: 'FlipAccepted',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipAccepted(log.args));
    },
  });
}

export function useWatchFlipResolved(onFlipResolved: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    eventName: 'FlipResolved',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipResolved(log.args));
    },
  });
}

export function useWatchFlipCancelled(onFlipCancelled: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    eventName: 'FlipCancelled',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipCancelled(log.args));
    },
  });
}

export function useWatchWinningsClaimed(onWinningsClaimed: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.flipBattle,
    abi: ABIS.flipBattle,
    eventName: 'WinningsClaimed',
    onLogs(logs) {
      logs.forEach((log: any) => onWinningsClaimed(log.args));
    },
  });
}

// Watch StreakManager events
export function useWatchCheckIn(onCheckIn: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    eventName: 'CheckIn',
    onLogs(logs) {
      logs.forEach((log: any) => onCheckIn(log.args));
    },
  });
}

export function useWatchStreakRewardClaimed(onRewardClaimed: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.streakManager,
    abi: ABIS.streakManager,
    eventName: 'RewardClaimed',
    onLogs(logs) {
      logs.forEach((log: any) => onRewardClaimed(log.args));
    },
  });
}

// Watch ReferralSystem events
export function useWatchUserRegistered(onUserRegistered: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    eventName: 'UserRegistered',
    onLogs(logs) {
      logs.forEach((log: any) => onUserRegistered(log.args));
    },
  });
}

export function useWatchReferralEarned(onReferralEarned: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    eventName: 'ReferralEarned',
    onLogs(logs) {
      logs.forEach((log: any) => onReferralEarned(log.args));
    },
  });
}

export function useWatchReferralEarningsClaimed(onEarningsClaimed: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.referralSystem,
    abi: ABIS.referralSystem,
    eventName: 'EarningsClaimed',
    onLogs(logs) {
      logs.forEach((log: any) => onEarningsClaimed(log.args));
    },
  });
}

// Watch DailyFreeFlip events
export function useWatchDailyFlipEntered(onFlipEntered: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    eventName: 'DailyFlipEntered',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipEntered(log.args));
    },
  });
}

export function useWatchDailyFlipResolved(onFlipResolved: (data: any) => void) {
  const { chainId } = useAccount();
  const contracts = getContracts(chainId || 84532);

  useWatchContractEvent({
    address: contracts.dailyFreeFlip,
    abi: ABIS.dailyFreeFlip,
    eventName: 'DailyFlipResolved',
    onLogs(logs) {
      logs.forEach((log: any) => onFlipResolved(log.args));
    },
  });
}
