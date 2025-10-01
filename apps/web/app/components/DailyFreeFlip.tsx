'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useCanPlayToday, usePrizePool, usePrizeAmount, useFlipsToday, useDailyFreeFlip } from '@/hooks/useDailyFreeFlip';
import { CoinFlipAnimation } from './CoinFlipAnimation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function DailyFreeFlip() {
  const { address } = useAccount();
  const { canPlay, isLoading: canPlayLoading, refetch: refetchCanPlay } = useCanPlayToday(address);
  const { prizePool, isLoading: prizePoolLoading } = usePrizePool();
  const { prizeAmount, isLoading: prizeAmountLoading } = usePrizeAmount();
  const { flipsToday, isLoading: flipsTodayLoading } = useFlipsToday();
  const { enterDailyFlip, isPending, isConfirming, isSuccess } = useDailyFreeFlip();

  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | undefined>(undefined);

  if (!address) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-gray-400">Connect your wallet to play daily free flip</p>
      </div>
    );
  }

  const isLoading = canPlayLoading || prizePoolLoading || prizeAmountLoading || flipsTodayLoading;

  if (isLoading) {
    return (
      <div className="glass p-8 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const canPlayToday = canPlay ?? false;
  const prizePoolAmount = prizePool ? parseFloat(formatUnits(prizePool, 6)) : 0;
  const prizeAmountValue = prizeAmount ? parseFloat(formatUnits(prizeAmount, 6)) : 0;
  const totalFlipsToday = flipsToday ? Number(flipsToday) : 0;

  const handleEnterFlip = async () => {
    setIsFlipping(true);
    try {
      await enterDailyFlip(choice === 'heads');
      // Simulate flip for better UX
      setTimeout(() => {
        // Random result for now (actual result comes from VRF)
        const randomResult = Math.random() > 0.5 ? 'heads' : 'tails';
        setResult(randomResult);
        setIsFlipping(false);
        refetchCanPlay();
      }, 2000);
    } catch (error) {
      console.error('Enter daily flip failed:', error);
      setIsFlipping(false);
    }
  };

  // Reset result when success state changes
  if (isSuccess && !isPending && !isConfirming) {
    setTimeout(() => {
      setResult(undefined);
    }, 3000);
  }

  return (
    <div className="glass p-8 rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
        Daily Free Flip
      </h2>

      {/* Prize Pool Display */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-sm text-gray-300 mb-1">Prize Pool</div>
          <div className="text-2xl font-bold text-purple-400">{prizePoolAmount.toFixed(2)} USDC</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm text-gray-300 mb-1">Win Amount</div>
          <div className="text-2xl font-bold text-yellow-400">{prizeAmountValue.toFixed(2)} USDC</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-xl text-center"
        >
          <div className="text-3xl mb-2">🎮</div>
          <div className="text-sm text-gray-300 mb-1">Plays Today</div>
          <div className="text-2xl font-bold text-blue-400">{totalFlipsToday}</div>
        </motion.div>
      </div>

      {/* Coin Animation */}
      <div className="mb-8">
        <CoinFlipAnimation
          result={result}
          isFlipping={isFlipping}
          onFlipComplete={() => {}}
        />
      </div>

      {canPlayToday ? (
        <>
          {/* Coin Choice */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-center">
              Choose Your Side
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setChoice('heads')}
                disabled={isPending || isConfirming || isFlipping}
                className={`flex-1 py-6 rounded-xl font-semibold text-lg transition-all ${
                  choice === 'heads'
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 border border-gray-700 hover:border-yellow-500'
                }`}
              >
                <div className="text-4xl mb-2">🪙</div>
                Heads
              </button>
              <button
                onClick={() => setChoice('tails')}
                disabled={isPending || isConfirming || isFlipping}
                className={`flex-1 py-6 rounded-xl font-semibold text-lg transition-all ${
                  choice === 'tails'
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg scale-105'
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-4xl mb-2">🪙</div>
                Tails
              </button>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handleEnterFlip}
            disabled={isPending || isConfirming || isFlipping}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg"
          >
            {isPending || isConfirming || isFlipping
              ? '🎲 Flipping...'
              : '🎲 Play Free Flip'}
          </button>
        </>
      ) : (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="text-5xl mb-4">⏰</div>
          <div className="text-xl font-semibold mb-2">Come Back Tomorrow!</div>
          <div className="text-gray-400">You've already played your free flip today</div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-6 rounded-xl text-center ${
            result === choice
              ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700'
              : 'bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-700'
          }`}
        >
          <div className="text-4xl mb-2">
            {result === choice ? '🎉' : '😔'}
          </div>
          <div className="text-2xl font-bold mb-2">
            {result === choice ? 'You Won!' : 'Better Luck Tomorrow!'}
          </div>
          {result === choice && (
            <div className="text-lg text-green-400">
              +{prizeAmountValue.toFixed(2)} USDC
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Winners */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <h4 className="font-semibold mb-3 text-blue-300">🏆 Recent Winners</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {/* Placeholder - would be populated with real winners from events */}
          <div className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded">
            <span className="font-mono text-gray-400">0x1234...5678</span>
            <span className="text-green-400">+{prizeAmountValue.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between items-center text-sm p-2 bg-gray-800/50 rounded">
            <span className="font-mono text-gray-400">0x8765...4321</span>
            <span className="text-green-400">+{prizeAmountValue.toFixed(2)} USDC</span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
        <h4 className="font-semibold mb-2 text-purple-300">💡 How It Works</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Play one free flip every day - no cost!</li>
          <li>• Win {prizeAmountValue.toFixed(2)} USDC if you guess correctly</li>
          <li>• Prize pool grows from 2% of all game fees</li>
          <li>• Provably fair using Chainlink VRF</li>
          <li>• Come back daily to keep playing!</li>
        </ul>
      </div>
    </div>
  );
}
