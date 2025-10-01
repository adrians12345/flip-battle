'use client';

import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useReferralEarnings, useReferralCount, useReferrals, useIsRegistered, useReferralSystem } from '@/hooks/useReferralSystem';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function ReferralDashboard() {
  const { address } = useAccount();
  const { earnings, isLoading: earningsLoading, refetch: refetchEarnings } = useReferralEarnings(address);
  const { count, isLoading: countLoading } = useReferralCount(address);
  const { referrals, isLoading: referralsLoading } = useReferrals(address);
  const { isRegistered } = useIsRegistered(address);
  const { claimEarnings, isPending, isConfirming, isSuccess } = useReferralSystem();

  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <p className="text-gray-400">Connect your wallet to view referrals</p>
      </div>
    );
  }

  const isLoading = earningsLoading || countLoading || referralsLoading;

  if (isLoading) {
    return (
      <div className="glass p-8 rounded-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalEarnings = earnings ? parseFloat(formatUnits(earnings, 6)) : 0;
  const referralCount = count ? Number(count) : 0;
  const referralList = referrals ?? [];

  // Generate referral link
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${address}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimEarnings = async () => {
    try {
      await claimEarnings();
      refetchEarnings();
    } catch (error) {
      console.error('Claim earnings failed:', error);
    }
  };

  // Calculate tier based on referrals
  const getTier = () => {
    if (referralCount >= 50) return { name: 'Diamond', emoji: '💎', color: 'from-cyan-600 to-blue-600' };
    if (referralCount >= 25) return { name: 'Platinum', emoji: '🏆', color: 'from-gray-400 to-gray-600' };
    if (referralCount >= 10) return { name: 'Gold', emoji: '👑', color: 'from-yellow-600 to-orange-600' };
    if (referralCount >= 5) return { name: 'Silver', emoji: '⭐', color: 'from-gray-500 to-gray-600' };
    return { name: 'Bronze', emoji: '🥉', color: 'from-orange-700 to-orange-800' };
  };

  const tier = getTier();

  return (
    <div className="glass p-8 rounded-2xl">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
        Referral Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl"
        >
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold text-green-400">{referralCount}</div>
          <div className="text-sm text-gray-300">Total Referrals</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl"
        >
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold text-yellow-400">{totalEarnings.toFixed(2)}</div>
          <div className="text-sm text-gray-300">USDC Earned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 bg-gradient-to-br ${tier.color} rounded-xl relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-10">{tier.emoji}</div>
          <div className="relative z-10">
            <div className="text-4xl mb-2">{tier.emoji}</div>
            <div className="text-2xl font-bold text-white">{tier.name}</div>
            <div className="text-sm text-white/80">Tier Status</div>
          </div>
        </motion.div>
      </div>

      {/* Referral Link */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm text-gray-300"
          />
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Share this link to earn 5% of your referrals' bets + 1 USDC signup bonus!
        </p>
      </div>

      {/* Claim Earnings */}
      {totalEarnings > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-300 mb-1">Available to Claim</div>
              <div className="text-3xl font-bold text-yellow-400">{totalEarnings.toFixed(2)} USDC</div>
            </div>
            <button
              onClick={handleClaimEarnings}
              disabled={isPending || isConfirming || totalEarnings === 0}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-lg"
            >
              {isPending || isConfirming
                ? 'Claiming...'
                : isSuccess
                ? '✓ Claimed!'
                : '💰 Claim Earnings'}
            </button>
          </div>
        </div>
      )}

      {/* Referral List */}
      {referralList.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Your Referrals ({referralList.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {referralList.map((referral, index) => (
              <motion.div
                key={referral}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👤</div>
                  <div className="font-mono text-sm">
                    {referral.slice(0, 6)}...{referral.slice(-4)}
                  </div>
                </div>
                <div className="text-xs text-green-400">Active</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tier Progress */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Tier Progress</h3>
        <div className="space-y-3">
          {[
            { tier: 'Bronze', min: 0, emoji: '🥉' },
            { tier: 'Silver', min: 5, emoji: '⭐' },
            { tier: 'Gold', min: 10, emoji: '👑' },
            { tier: 'Platinum', min: 25, emoji: '🏆' },
            { tier: 'Diamond', min: 50, emoji: '💎' },
          ].map((t) => {
            const isAchieved = referralCount >= t.min;
            const isCurrent = tier.name === t.tier;
            return (
              <div key={t.tier} className="flex items-center gap-3">
                <div className={`text-2xl ${isAchieved ? 'opacity-100' : 'opacity-30'}`}>
                  {t.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isCurrent ? 'font-bold text-green-400' : ''}>
                      {t.tier} {isCurrent ? '(Current)' : ''}
                    </span>
                    <span className="text-gray-400">{t.min} referrals</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isAchieved ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                      }`}
                      style={{ width: isAchieved ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-300">💡 How Referrals Work</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Share your unique referral link with friends</li>
          <li>• Earn 1 USDC when someone signs up using your link</li>
          <li>• Earn 5% of all bets placed by your referrals</li>
          <li>• Climb tiers to unlock exclusive benefits (coming soon!)</li>
          <li>• Claim your earnings anytime</li>
        </ul>
      </div>
    </div>
  );
}
