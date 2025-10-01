'use client';

import { formatUnits, Address } from 'viem';
import { useAccount } from 'wagmi';
import { useFlipDetails, useFlipBattle } from '@/hooks/useFlipBattle';
import { CoinFlipAnimation } from './CoinFlipAnimation';
import { FarcasterProfile } from './FarcasterProfile';
import { ShareButton } from './ShareButton';
import { useState } from 'react';

interface GameCardProps {
  flipId: bigint;
}

type GameState = 0 | 1 | 2 | 3 | 4; // Pending, Active, Completed, Cancelled, Expired

export function GameCard({ flipId }: GameCardProps) {
  const { address } = useAccount();
  const { flip, isLoading } = useFlipDetails(flipId);
  const { acceptFlip, cancelFlip, claimWinnings, isPending, isConfirming } = useFlipBattle();
  const [isFlipping, setIsFlipping] = useState(false);

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-xl animate-pulse">
        <div className="h-6 bg-gray-700 rounded mb-4"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!flip) {
    return (
      <div className="glass p-6 rounded-xl">
        <p className="text-gray-400">Game not found</p>
      </div>
    );
  }

  const [creator, opponent, betAmount, creatorChoice, result, state, createdAt, vrfRequestId] = flip as any;
  const gameState = state as GameState;

  const betAmountFormatted = formatUnits(betAmount, 6);
  const isCreator = address?.toLowerCase() === (creator as Address).toLowerCase();
  const isOpponent = address?.toLowerCase() === (opponent as Address).toLowerCase();
  const canAccept = gameState === 0 && isOpponent;
  const canCancel = gameState === 0 && isCreator;
  const isCompleted = gameState === 2;
  const isCancelled = gameState === 3;
  const isExpired = gameState === 4;

  // Determine winner
  let winner: Address | null = null;
  if (isCompleted && result !== undefined) {
    const creatorWon = (creatorChoice === 0 && result === 0) || (creatorChoice === 1 && result === 1);
    winner = creatorWon ? creator : opponent;
  }
  const isWinner = winner?.toLowerCase() === address?.toLowerCase();
  const canClaim = isCompleted && isWinner && vrfRequestId > BigInt(0);

  const handleAccept = async () => {
    setIsFlipping(true);
    try {
      await acceptFlip(flipId);
      // Animation will continue, result will update from contract event
    } catch (error) {
      console.error('Accept failed:', error);
      setIsFlipping(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelFlip(flipId);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleClaim = async () => {
    try {
      await claimWinnings(flipId);
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  const getStateLabel = () => {
    switch (gameState) {
      case 0: return 'Pending';
      case 1: return 'Active';
      case 2: return 'Completed';
      case 3: return 'Cancelled';
      case 4: return 'Expired';
      default: return 'Unknown';
    }
  };

  const getStateColor = () => {
    switch (gameState) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-blue-400';
      case 2: return 'text-green-400';
      case 3: return 'text-gray-400';
      case 4: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="glass p-6 rounded-xl hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Game #{flipId.toString()}</div>
          <div className={`text-sm font-semibold ${getStateColor()}`}>
            {getStateLabel()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{betAmountFormatted} USDC</div>
          <div className="text-xs text-gray-400">Bet Amount</div>
        </div>
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg ${isCreator ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800/50'}`}>
          <div className="text-xs text-gray-400 mb-2">Creator</div>
          {isCreator ? (
            <div className="font-semibold">You</div>
          ) : (
            <FarcasterProfile address={creator as Address} showAvatar={true} showUsername={true} size="sm" />
          )}
          <div className="text-xs mt-2 text-yellow-400">
            {creatorChoice === 0 ? '🪙 Heads' : '🪙 Tails'}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isOpponent ? 'bg-purple-900/30 border border-purple-700' : 'bg-gray-800/50'}`}>
          <div className="text-xs text-gray-400 mb-2">Opponent</div>
          {isOpponent ? (
            <div className="font-semibold">You</div>
          ) : (
            <FarcasterProfile address={opponent as Address} showAvatar={true} showUsername={true} size="sm" />
          )}
          <div className="text-xs mt-2 text-gray-400">
            {creatorChoice === 0 ? '🪙 Tails' : '🪙 Heads'}
          </div>
        </div>
      </div>

      {/* Coin Animation (only for active/completed games) */}
      {(gameState === 1 || gameState === 2) && (
        <CoinFlipAnimation
          result={result === 0 ? 'heads' : result === 1 ? 'tails' : undefined}
          isFlipping={isFlipping || gameState === 1}
          onFlipComplete={() => setIsFlipping(false)}
        />
      )}

      {/* Result */}
      {isCompleted && winner && (
        <div className={`p-4 rounded-lg mb-4 ${isWinner ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          <div className="text-center">
            <div className="text-lg font-bold mb-1">
              {isWinner ? '🎉 You Won!' : '😔 You Lost'}
            </div>
            <div className="text-sm text-gray-300">
              {isWinner ? `+${(parseFloat(betAmountFormatted) * 1.95).toFixed(2)} USDC` : `-${betAmountFormatted} USDC`}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {canAccept && (
          <button
            onClick={handleAccept}
            disabled={isPending || isConfirming}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            {isPending || isConfirming ? 'Accepting...' : 'Accept Challenge'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={isPending || isConfirming}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            {isPending || isConfirming ? 'Cancelling...' : 'Cancel Challenge'}
          </button>
        )}

        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming}
            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
          >
            {isPending || isConfirming ? 'Claiming...' : '💰 Claim Winnings'}
          </button>
        )}
      </div>

      {/* Share Button for Completed Games */}
      {isCompleted && (
        <div className="mt-4">
          <ShareButton
            text={
              isWinner
                ? `Just won ${(parseFloat(betAmountFormatted) * 1.95).toFixed(2)} USDC on Flip Battle! 🎉\n\nThink you can beat me?`
                : `Lost this round on Flip Battle, but I'll be back! 💪\n\nChallenge me!`
            }
            variant={isWinner ? 'primary' : 'outline'}
            size="sm"
          />
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Created: {new Date(Number(createdAt) * 1000).toLocaleString()}
      </div>
    </div>
  );
}
