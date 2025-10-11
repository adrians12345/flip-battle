'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbi, formatEther, type Address } from 'viem';
import { base } from 'viem/chains';

const ACTIVITY_ABI = parseAbi([
  'function getUserStats(address) external view returns (uint256, uint256)',
]);

interface Stats {
  totalActivities: number;
  lastActivity: Date | null;
  balance: string;
  daysRemaining: number;
  isHealthy: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const savedContract = localStorage.getItem('contractAddress') || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    const savedWallet = localStorage.getItem('walletAddress') || process.env.NEXT_PUBLIC_WALLET_ADDRESS || '';
    setContractAddress(savedContract);
    setWalletAddress(savedWallet);
  }, []);

  useEffect(() => {
    if (!contractAddress || !walletAddress) return;

    const fetchStats = async () => {
      try {
        const client = createPublicClient({
          chain: base,
          transport: http('https://mainnet.base.org'),
        });

        const [userStats, balance] = await Promise.all([
          client.readContract({
            address: contractAddress as Address,
            abi: ACTIVITY_ABI,
            functionName: 'getUserStats',
            args: [walletAddress as Address],
          }),
          client.getBalance({ address: walletAddress as Address }),
        ]);

        const [activityCount, lastActivityTimestamp] = userStats;
        const lastActivity = lastActivityTimestamp > 0 ? new Date(Number(lastActivityTimestamp) * 1000) : null;
        const balanceEth = parseFloat(formatEther(balance));
        const daysRemaining = Math.floor(balanceEth / 0.00002);
        const isHealthy = lastActivity ? (Date.now() - lastActivity.getTime()) < 2 * 60 * 60 * 1000 : false;

        setStats({
          totalActivities: Number(activityCount),
          lastActivity,
          balance: balanceEth.toFixed(6),
          daysRemaining,
          isHealthy,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [contractAddress, walletAddress]);

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 Activity Generator Dashboard</h1>
          <p className="text-gray-400">Base Mainnet - Real-time Monitoring</p>
        </div>

        {!contractAddress || !walletAddress ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">⚙️ Configuration</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Contract Address (0x...)"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Wallet Address (0x...)"
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  localStorage.setItem('contractAddress', contractAddress);
                  localStorage.setItem('walletAddress', walletAddress);
                  window.location.reload();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold transition"
              >
                Save & Monitor
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading stats...</p>
          </div>
        ) : stats ? (
          <>
            <div className={`mb-6 p-4 rounded-lg border ${stats.isHealthy ? 'bg-green-900/20 border-green-700' : 'bg-yellow-900/20 border-yellow-700'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stats.isHealthy ? '✅' : '⚠️'}</span>
                <div>
                  <p className="font-semibold">{stats.isHealthy ? 'System Healthy' : 'System Inactive'}</p>
                  <p className="text-sm text-gray-300">{stats.isHealthy ? 'Bot generating activity' : 'No activity in 2 hours'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Activities" value={stats.totalActivities.toString()} icon="📊" />
              <StatCard title="Last Activity" value={stats.lastActivity ? formatTimeSince(stats.lastActivity) : 'Never'} icon="⏰" />
              <StatCard title="Balance" value={`${stats.balance} ETH`} icon="💰" alert={parseFloat(stats.balance) < 0.001} />
              <StatCard title="Days Remaining" value={`~${stats.daysRemaining}d`} icon="📅" alert={stats.daysRemaining < 7} />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-bold mb-4">📝 Contract Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract</span>
                  <a href={`https://basescan.org/address/${contractAddress}`} target="_blank" className="text-blue-400 hover:text-blue-300 font-mono">
                    {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wallet</span>
                  <a href={`https://basescan.org/address/${walletAddress}`} target="_blank" className="text-blue-400 hover:text-blue-300 font-mono">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span>Base Mainnet (8453)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Cost</span>
                  <span>~$0.06-0.12</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-700">
              <h2 className="text-xl font-bold mb-4">🏆 Base Builder Rewards</h2>
              <p className="text-gray-300 mb-4">Your onchain activity is being tracked!</p>
              <div className="flex gap-4">
                <a href="https://builderscore.xyz" target="_blank" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-semibold transition">
                  Check Leaderboard
                </a>
                <a href={`https://basescan.org/address/${contractAddress}`} target="_blank" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-semibold transition">
                  View on Basescan
                </a>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Auto-refreshing every 30 seconds
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, alert }: { title: string; value: string; icon: string; alert?: boolean }) {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 border ${alert ? 'border-yellow-500' : 'border-gray-700'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${alert ? 'text-yellow-400' : ''}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
