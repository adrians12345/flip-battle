'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Address, isAddress, formatUnits } from 'viem';
import { useFlipBattle, useUSDCAllowance, useApproveUSDC, useUSDCBalance, useMinimumBet } from '@/hooks/useFlipBattle';

export function FlipGame() {
  const { address } = useAccount();
  const [opponent, setOpponent] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [step, setStep] = useState<'input' | 'approve' | 'create'>('input');

  const { createFlip, isPending: isCreating, isConfirming: isCreatingConfirming, isSuccess: isCreateSuccess } = useFlipBattle();
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirming, isSuccess: isApproveSuccess } = useApproveUSDC();
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const { balance } = useUSDCBalance(address);
  const { minimumBet } = useMinimumBet();

  const isValidOpponent = opponent && isAddress(opponent);
  const betAmountNum = parseFloat(betAmount || '0');
  const minimumBetNum = minimumBet ? parseFloat(formatUnits(minimumBet, 6)) : 1;
  const balanceNum = balance ? parseFloat(formatUnits(balance, 6)) : 0;
  const allowanceNum = allowance ? parseFloat(formatUnits(allowance, 6)) : 0;

  const needsApproval = allowanceNum < betAmountNum;
  const canCreate = isValidOpponent && betAmountNum >= minimumBetNum && betAmountNum <= balanceNum && !needsApproval;

  const handleApprove = async () => {
    if (!betAmount) return;
    try {
      await approve(betAmount);
      setStep('create');
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleCreateFlip = async () => {
    if (!isValidOpponent || !betAmount) return;
    try {
      await createFlip(opponent as Address, betAmount, choice === 'heads');
      // Reset form on success
      setOpponent('');
      setBetAmount('');
      setStep('input');
    } catch (error) {
      console.error('Create flip failed:', error);
    }
  };

  // Refetch allowance after approval success
  if (isApproveSuccess && step === 'approve') {
    refetchAllowance();
    setStep('create');
  }

  // Reset after successful flip creation
  if (isCreateSuccess) {
    setTimeout(() => {
      setStep('input');
    }, 2000);
  }

  if (!address) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-gray-400">Connect your wallet to start playing</p>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-2xl max-w-2xl w-full">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        Create a Flip Challenge
      </h2>

      {/* Wallet Info */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Your USDC Balance:</span>
          <span className="font-semibold">{balanceNum.toFixed(2)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Approved Amount:</span>
          <span className="font-semibold">{allowanceNum.toFixed(2)} USDC</span>
        </div>
      </div>

      {/* Opponent Address */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Opponent Address
        </label>
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
        />
        {opponent && !isValidOpponent && (
          <p className="text-red-500 text-xs mt-1">Invalid Ethereum address</p>
        )}
      </div>

      {/* Bet Amount */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Bet Amount (USDC)
        </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder={`Min: ${minimumBetNum} USDC`}
          min={minimumBetNum}
          step="0.01"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        {betAmountNum > 0 && betAmountNum < minimumBetNum && (
          <p className="text-red-500 text-xs mt-1">Minimum bet is {minimumBetNum} USDC</p>
        )}
        {betAmountNum > balanceNum && (
          <p className="text-red-500 text-xs mt-1">Insufficient balance</p>
        )}
      </div>

      {/* Coin Choice */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Your Choice
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setChoice('heads')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
              choice === 'heads'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'bg-gray-800 border border-gray-700 hover:border-yellow-500'
            }`}
          >
            🪙 Heads
          </button>
          <button
            onClick={() => setChoice('tails')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
              choice === 'tails'
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg'
                : 'bg-gray-800 border border-gray-700 hover:border-gray-400'
            }`}
          >
            🪙 Tails
          </button>
        </div>
      </div>

      {/* Potential Winnings */}
      {betAmountNum > 0 && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-300">Potential Winnings:</span>
            <span className="text-2xl font-bold text-blue-400">
              {(betAmountNum * 1.95).toFixed(2)} USDC
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">5% platform fee applied</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {needsApproval && betAmountNum > 0 ? (
          <button
            onClick={handleApprove}
            disabled={isApproving || isApprovingConfirming || !betAmount}
            className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {isApproving || isApprovingConfirming
              ? 'Approving USDC...'
              : `Approve ${betAmount} USDC`}
          </button>
        ) : (
          <button
            onClick={handleCreateFlip}
            disabled={!canCreate || isCreating || isCreatingConfirming}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            {isCreating || isCreatingConfirming
              ? 'Creating Challenge...'
              : isCreateSuccess
              ? '✓ Challenge Created!'
              : 'Create Challenge'}
          </button>
        )}

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setBetAmount('1')}
            className="flex-1 py-2 bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg text-sm transition-colors"
          >
            1 USDC
          </button>
          <button
            onClick={() => setBetAmount('5')}
            className="flex-1 py-2 bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg text-sm transition-colors"
          >
            5 USDC
          </button>
          <button
            onClick={() => setBetAmount('10')}
            className="flex-1 py-2 bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg text-sm transition-colors"
          >
            10 USDC
          </button>
          <button
            onClick={() => setBetAmount(balanceNum.toString())}
            disabled={balanceNum === 0}
            className="flex-1 py-2 bg-gray-800 border border-gray-700 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
          >
            Max
          </button>
        </div>
      </div>
    </div>
  );
}
