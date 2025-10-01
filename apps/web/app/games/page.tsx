'use client';

import { useAccount } from 'wagmi';
import { useUserFlips } from '@/hooks/useFlipBattle';
import { GameCard } from '@/components/GameCard';
import { ConnectButton } from '@/components/ConnectButton';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GamesPage() {
  const { address, isConnected } = useAccount();
  const { flipIds, isLoading } = useUserFlips(address);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            My Games
          </h1>
          <p className="text-gray-400 mb-8">Connect your wallet to view your games</p>
          <ConnectButton />
        </div>
      </main>
    );
  }

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
            <Link href="/games" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Games
            </Link>
            <Link href="/profile" className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">
              Profile
            </Link>
          </nav>

          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Games</h2>
          <p className="text-gray-400">View all your active and completed flip battles</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold whitespace-nowrap shadow-lg">
            All Games
          </button>
          <button className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 rounded-lg font-semibold whitespace-nowrap transition-colors">
            Pending
          </button>
          <button className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 rounded-lg font-semibold whitespace-nowrap transition-colors">
            Active
          </button>
          <button className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 rounded-lg font-semibold whitespace-nowrap transition-colors">
            Completed
          </button>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : flipIds && flipIds.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {flipIds.map((flipId, index) => (
              <motion.div
                key={flipId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GameCard flipId={flipId} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold mb-2">No Games Yet</h3>
            <p className="text-gray-400 mb-8">Create your first flip battle to get started!</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              Create Game
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
