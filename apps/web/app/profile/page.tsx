'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/ConnectButton';
import { StatsDisplay } from '@/components/StatsDisplay';
import { StreakTracker } from '@/components/StreakTracker';
import { ReferralDashboard } from '@/components/ReferralDashboard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useUserStats } from '@/hooks/useFlipBattle';
import { useCurrentStreak } from '@/hooks/useStreakManager';
import { useReferralCount } from '@/hooks/useReferralSystem';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { stats } = useUserStats(address);
  const { streak } = useCurrentStreak(address);
  const { count: referralCount } = useReferralCount(address);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Profile
          </h1>
          <p className="text-gray-400 mb-8">Connect your wallet to view your profile</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

  const gamesPlayed = stats ? Number(stats.gamesPlayed) : 0;
  const gamesWon = stats ? Number(stats.gamesWon) : 0;
  const totalWagered = stats ? parseFloat(formatUnits(stats.totalWagered, 6)) : 0;
  const totalWinnings = stats ? parseFloat(formatUnits(stats.totalWinnings, 6)) : 0;
  const currentStreak = streak ? Number(streak) : 0;
  const totalReferrals = referralCount ? Number(referralCount) : 0;

  // Calculate achievements
  const achievements = [
    {
      emoji: '🎮',
      title: 'First Flip',
      description: 'Completed your first flip battle',
      unlocked: gamesPlayed >= 1,
    },
    {
      emoji: '🏆',
      title: 'Winner',
      description: 'Won 10 flip battles',
      unlocked: gamesWon >= 10,
    },
    {
      emoji: '🔥',
      title: 'On Fire',
      description: 'Reached a 7-day streak',
      unlocked: currentStreak >= 7,
    },
    {
      emoji: '👥',
      title: 'Influencer',
      description: 'Referred 5 players',
      unlocked: totalReferrals >= 5,
    },
    {
      emoji: '💰',
      title: 'High Roller',
      description: 'Wagered 100 USDC total',
      unlocked: totalWagered >= 100,
    },
    {
      emoji: '🌟',
      title: 'Champion',
      description: 'Won 50 flip battles',
      unlocked: gamesWon >= 50,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="text-3xl">🪙</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Flip Battle
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/games" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">
              Games
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Profile
            </Link>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Player Profile</h2>
              <p className="font-mono text-sm text-gray-400 mb-4">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <div className="flex gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{gamesPlayed}</div>
                  <div className="text-xs text-gray-400">Games</div>
                </div>
                <div className="border-l border-gray-700 pl-4">
                  <div className="text-2xl font-bold text-green-400">{gamesWon}</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>
                <div className="border-l border-gray-700 pl-4">
                  <div className="text-2xl font-bold text-orange-400">{currentStreak}</div>
                  <div className="text-xs text-gray-400">Streak</div>
                </div>
                <div className="border-l border-gray-700 pl-4">
                  <div className="text-2xl font-bold text-purple-400">{totalReferrals}</div>
                  <div className="text-xs text-gray-400">Referrals</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-2xl mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`p-4 rounded-lg text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/50'
                    : 'bg-gray-800/50 border border-gray-700 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.emoji}</div>
                <div className="font-semibold text-sm mb-1">{achievement.title}</div>
                <div className="text-xs text-gray-400">{achievement.description}</div>
                {achievement.unlocked && (
                  <div className="mt-2 text-xs text-yellow-400">✓ Unlocked</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsDisplay />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <StreakTracker />
          </motion.div>
        </div>

        {/* Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReferralDashboard />
        </motion.div>

        {/* Transaction History (WalletConnect Blockchain API) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <TransactionHistory />
        </motion.div>
      </section>
    </main>
  );
}
