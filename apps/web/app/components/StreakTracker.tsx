'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useCurrentStreak, useCanCheckIn, useAvailableRewards, useStreakManager } from '@/hooks/useStreakManager';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function StreakTracker() {
  const { address } = useAccount();
  const { streak, isLoading: streakLoading, refetch: refetchStreak } = useCurrentStreak(address);
  const { canCheckIn, isLoading: canCheckInLoading, refetch: refetchCanCheckIn } = useCanCheckIn(address);
  const { rewards, isLoading: rewardsLoading, refetch: refetchRewards } = useAvailableRewards(address);
  const { checkIn, claimReward, isPending, isConfirming, isSuccess } = useStreakManager();

  const [lastAction, setLastAction] = useState<'checkin' | 'claim' | null>(null);

  if (!address) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-gray-400">Connect your wallet to track streaks</p>
      </div>
    );
  }

  const isLoading = streakLoading || canCheckInLoading || rewardsLoading;

  if (isLoading) {
    return (
      <div className="glass p-8 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = streak ? Number(streak) : 0;
  const canCheckInToday = canCheckIn ?? false;

  const handleCheckIn = async () => {
    try {
      setLastAction('checkin');
      await checkIn();
      refetchStreak();
      refetchCanCheckIn();
      refetchRewards();
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleClaimReward = async (day: number) => {
    try {
      setLastAction('claim');
      await claimReward(day);
      refetchRewards();
    } catch (error) {
      console.error('Claim reward failed:', error);
    }
  };

  // Reset last action after success
  if (isSuccess && lastAction) {
    setTimeout(() => setLastAction(null), 2000);
  }

  // Streak milestones with rewards (matching smart contract)
  const milestones = [
    { day: 7, reward: 5, label: '1 Week', emoji: '🔥' },
    { day: 14, reward: 12, label: '2 Weeks', emoji: '💎' },
    { day: 30, reward: 30, label: '1 Month', emoji: '👑' },
    { day: 60, reward: 75, label: '2 Months', emoji: '🌟' },
    { day: 90, reward: 150, label: '3 Months', emoji: '🏆' },
  ];

  // Get rewards data
  const rewardDays = rewards?.days.map(d => Number(d)) ?? [];
  const rewardAmounts = rewards?.amounts.map(a => parseFloat(formatUnits(a, 6))) ?? [];
  const rewardClaimed = rewards?.claimed ?? [];

  return (
    <div className="glass p-8 rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
        Daily Streak Challenge
      </h2>

      {/* Current Streak Display */}
      <div className="mb-8 p-6 bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-700/50 rounded-xl text-center">
        <div className="text-6xl mb-2">🔥</div>
        <div className="text-5xl font-bold text-orange-400 mb-2">{currentStreak}</div>
        <div className="text-lg text-gray-300">Day Streak</div>

        {canCheckInToday ? (
          <button
            onClick={handleCheckIn}
            disabled={isPending || isConfirming}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            {isPending || isConfirming
              ? 'Checking In...'
              : isSuccess && lastAction === 'checkin'
              ? '✓ Checked In!'
              : '✓ Check In Today'}
          </button>
        ) : (
          <div className="mt-4 px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
            ✓ Already Checked In Today
          </div>
        )}
      </div>

      {/* Streak Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
        <div className="relative">
          {/* Progress bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentStreak / 90) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-5 gap-2">
            {milestones.map((milestone, index) => {
              const isAchieved = currentStreak >= milestone.day;
              const isAvailable = rewardDays.includes(milestone.day);
              const rewardIndex = rewardDays.indexOf(milestone.day);
              const isClaimed = rewardIndex >= 0 ? rewardClaimed[rewardIndex] : false;
              const canClaim = isAvailable && !isClaimed;

              return (
                <motion.div
                  key={milestone.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isAchieved
                      ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-700'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{milestone.emoji}</div>
                    <div className="text-xs text-gray-400 mb-1">{milestone.label}</div>
                    <div className="text-sm font-semibold mb-2">Day {milestone.day}</div>
                    <div className="text-xs text-orange-400 font-bold mb-2">
                      {milestone.reward} USDC
                    </div>

                    {isClaimed ? (
                      <div className="px-2 py-1 bg-green-900/50 border border-green-700 rounded text-xs text-green-400">
                        ✓ Claimed
                      </div>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleClaimReward(milestone.day)}
                        disabled={isPending || isConfirming}
                        className="w-full px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-all"
                      >
                        {isPending || isConfirming && lastAction === 'claim'
                          ? 'Claiming...'
                          : 'Claim'}
                      </button>
                    ) : isAchieved ? (
                      <div className="px-2 py-1 bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-400">
                        🎉 Achieved
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-xs text-gray-500">
                        {milestone.day - currentStreak} days
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-300">💡 Streak Tips</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Check in every day to maintain your streak</li>
          <li>• Miss a day and your streak resets to 0</li>
          <li>• Claim rewards at milestone days (7, 14, 30, 60, 90)</li>
          <li>• Bigger rewards for longer streaks!</li>
        </ul>
      </div>
    </div>
  );
}
