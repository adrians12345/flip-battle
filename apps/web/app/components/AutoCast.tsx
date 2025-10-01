'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useWatchFlipCreated, useWatchFlipResolved } from '@/hooks/useContractEvents';
import { ShareButton } from './ShareButton';

export function AutoCast() {
  const { address } = useAccount();
  const [recentFlipCreated, setRecentFlipCreated] = useState<any>(null);
  const [recentFlipResolved, setRecentFlipResolved] = useState<any>(null);

  // Watch for FlipCreated events
  useWatchFlipCreated((data) => {
    if (data.creator?.toLowerCase() === address?.toLowerCase()) {
      setRecentFlipCreated(data);
    }
  });

  // Watch for FlipResolved events
  useWatchFlipResolved((data) => {
    if (data.creator?.toLowerCase() === address?.toLowerCase() ||
        data.opponent?.toLowerCase() === address?.toLowerCase()) {
      setRecentFlipResolved(data);
    }
  });

  // Auto-cast challenge created
  useEffect(() => {
    if (recentFlipCreated && address) {
      const betAmount = formatUnits(recentFlipCreated.betAmount, 6);
      const choice = recentFlipCreated.creatorChoice === 0 ? 'Heads' : 'Tails';

      console.log('🎲 New flip challenge created!', {
        flipId: recentFlipCreated.flipId?.toString(),
        betAmount,
        choice,
      });
    }
  }, [recentFlipCreated, address]);

  // Auto-cast game result
  useEffect(() => {
    if (recentFlipResolved && address) {
      const isWinner = recentFlipResolved.winner?.toLowerCase() === address?.toLowerCase();
      const betAmount = formatUnits(recentFlipResolved.betAmount, 6);
      const payout = formatUnits(recentFlipResolved.payout, 6);

      console.log('🎰 Flip battle resolved!', {
        flipId: recentFlipResolved.flipId?.toString(),
        isWinner,
        betAmount,
        payout,
      });
    }
  }, [recentFlipResolved, address]);

  // Show notification for recent challenge
  if (recentFlipCreated) {
    const betAmount = formatUnits(recentFlipCreated.betAmount || BigInt(0), 6);
    const choice = recentFlipCreated.creatorChoice === 0 ? 'Heads' : 'Tails';
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flipbattle.xyz';

    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <div className="glass p-4 rounded-xl border border-blue-700 shadow-2xl">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">🎲</div>
            <div className="flex-1">
              <h4 className="font-bold mb-1">Challenge Created!</h4>
              <p className="text-sm text-gray-300">
                {betAmount} USDC • {choice}
              </p>
            </div>
            <button
              onClick={() => setRecentFlipCreated(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <ShareButton
            text={`Just created a ${betAmount} USDC flip challenge on Flip Battle! 🎲\n\nWill you take me on?\n\nPlay now at ${appUrl}`}
            url={appUrl}
            variant="primary"
            size="sm"
          />
        </div>
      </div>
    );
  }

  // Show notification for resolved game
  if (recentFlipResolved) {
    const isWinner = recentFlipResolved.winner?.toLowerCase() === address?.toLowerCase();
    const betAmount = formatUnits(recentFlipResolved.betAmount || BigInt(0), 6);
    const payout = formatUnits(recentFlipResolved.payout || BigInt(0), 6);
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flipbattle.xyz';

    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <div className={`glass p-4 rounded-xl shadow-2xl border ${
          isWinner ? 'border-green-700' : 'border-red-700'
        }`}>
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">{isWinner ? '🎉' : '😔'}</div>
            <div className="flex-1">
              <h4 className="font-bold mb-1">
                {isWinner ? 'You Won!' : 'Better Luck Next Time'}
              </h4>
              <p className="text-sm text-gray-300">
                {isWinner ? `+${payout} USDC` : `-${betAmount} USDC`}
              </p>
            </div>
            <button
              onClick={() => setRecentFlipResolved(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <ShareButton
            text={
              isWinner
                ? `Just won ${payout} USDC on Flip Battle! 🎉\n\nThink you can beat me?\n\nPlay now at ${appUrl}`
                : `Lost this round on Flip Battle, but I'll be back! 💪\n\nChallenge me at ${appUrl}`
            }
            url={appUrl}
            variant={isWinner ? 'primary' : 'secondary'}
            size="sm"
          />
        </div>
      </div>
    );
  }

  return null;
}
