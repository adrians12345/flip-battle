'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useUserStats } from '@/hooks/useFlipBattle';
import { motion } from 'framer-motion';

export function StatsDisplay() {
  const { address } = useAccount();
  const { stats, isLoading } = useUserStats(address);

  if (!address) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const gamesPlayed = Number(stats.gamesPlayed);
  const gamesWon = Number(stats.gamesWon);
  const totalWagered = parseFloat(formatUnits(stats.totalWagered, 6));
  const totalWinnings = parseFloat(formatUnits(stats.totalWinnings, 6));

  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : '0.0';
  const netProfit = totalWinnings - totalWagered;
  const isProfitable = netProfit > 0;

  const statCards = [
    {
      label: 'Games Played',
      value: gamesPlayed.toString(),
      icon: '🎮',
      color: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Games Won',
      value: gamesWon.toString(),
      icon: '🏆',
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      icon: '📊',
      color: 'from-purple-600 to-purple-700',
    },
    {
      label: 'Net Profit',
      value: `${isProfitable ? '+' : ''}${netProfit.toFixed(2)} USDC`,
      icon: isProfitable ? '💰' : '📉',
      color: isProfitable ? 'from-yellow-600 to-yellow-700' : 'from-red-600 to-red-700',
    },
  ];

  return (
    <div className="glass p-6 rounded-xl">
      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        Your Stats
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-4 rounded-lg bg-gradient-to-br ${stat.color} overflow-hidden`}
          >
            <div className="absolute top-0 right-0 text-6xl opacity-10">
              {stat.icon}
            </div>
            <div className="relative z-10">
              <div className="text-sm text-white/80 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Total Wagered</span>
            <span className="font-semibold">{totalWagered.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total Winnings</span>
            <span className="font-semibold">{totalWinnings.toFixed(2)} USDC</span>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Games Lost</span>
            <span className="font-semibold">{gamesPlayed - gamesWon}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Avg Bet Size</span>
            <span className="font-semibold">
              {gamesPlayed > 0 ? (totalWagered / gamesPlayed).toFixed(2) : '0.00'} USDC
            </span>
          </div>
        </div>
      </div>

      {/* Win Rate Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Win Rate Progress</span>
          <span className="font-semibold">{winRate}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${winRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-green-600"
          />
        </div>
      </div>

      {/* Performance Badge */}
      {gamesPlayed >= 10 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg text-center">
          <div className="text-3xl mb-2">
            {parseFloat(winRate) >= 70 ? '🔥' : parseFloat(winRate) >= 50 ? '⭐' : '💪'}
          </div>
          <div className="font-semibold">
            {parseFloat(winRate) >= 70
              ? 'Master Flipper!'
              : parseFloat(winRate) >= 50
              ? 'Skilled Player'
              : 'Keep Grinding!'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {gamesPlayed} games played
          </div>
        </div>
      )}
    </div>
  );
}
