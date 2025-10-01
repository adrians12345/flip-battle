'use client';

import { ConnectButton } from './components/ConnectButton';
import { FlipGame } from './components/FlipGame';
import { StatsDisplay } from './components/StatsDisplay';
import { DailyFreeFlip } from './components/DailyFreeFlip';
import { StreakTracker } from './components/StreakTracker';
import { ReferralDashboard } from './components/ReferralDashboard';
import { LiveEventFeed } from './components/LiveEventFeed';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'flip' | 'daily' | 'streak' | 'referral'>('flip');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🪙</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Flip Battle
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Home
            </Link>
            <Link href="/games" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">
              Games
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">
              Profile
            </Link>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      {!isConnected && (
        <section className="max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              Provably Fair Coin Flips
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Challenge friends, earn rewards, and win with transparency powered by Chainlink VRF on Base
            </p>

            <div className="flex justify-center gap-4 mb-12">
              <ConnectButton />
              <a
                href="https://docs.base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-700 hover:border-blue-500 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                emoji: '🎲',
                title: 'Provably Fair',
                description: 'Every flip uses Chainlink VRF for verifiable randomness. No manipulation possible.',
              },
              {
                emoji: '🔥',
                title: 'Daily Streaks',
                description: 'Check in daily to build streaks. Earn up to 150 USDC at 90-day milestone.',
              },
              {
                emoji: '💰',
                title: 'Referral Rewards',
                description: 'Earn 5% of all bets from referrals + 1 USDC signup bonus. Passive income!',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass p-6 rounded-xl hover:border-blue-500 transition-all"
              >
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content - Only show when connected */}
      {isConnected && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'flip' as const, label: '🎲 Flip Battle', emoji: '🎲' },
              { id: 'daily' as const, label: '🎁 Daily Free', emoji: '🎁' },
              { id: 'streak' as const, label: '🔥 Streaks', emoji: '🔥' },
              { id: 'referral' as const, label: '👥 Referrals', emoji: '👥' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {activeTab === 'flip' && <FlipGame />}
              {activeTab === 'daily' && <DailyFreeFlip />}
              {activeTab === 'streak' && <StreakTracker />}
              {activeTab === 'referral' && <ReferralDashboard />}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <StatsDisplay />

              {/* Live Event Feed */}
              <LiveEventFeed />

              {/* Quick Links */}
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/games"
                    className="block px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎮</span>
                      <span className="font-semibold">My Games</span>
                    </div>
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👤</span>
                      <span className="font-semibold">Profile</span>
                    </div>
                  </Link>
                  <a
                    href="https://basescan.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔍</span>
                      <span className="font-semibold">View on BaseScan</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p className="mb-2">Built on Base • Powered by Chainlink VRF • Farcaster Mini App</p>
          <p>© 2025 Flip Battle. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
