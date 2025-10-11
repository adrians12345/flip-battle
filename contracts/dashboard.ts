#!/usr/bin/env bun

/**
 * Activity Generator Dashboard
 * Real-time monitoring with Base Builder Rewards leaderboard integration
 */

import { createPublicClient, http, parseAbi, formatEther, type Address } from 'viem';
import { base } from 'viem/chains';

const ACTIVITY_ABI = parseAbi([
  'function activityCount(address) external view returns (uint256)',
  'function lastActivity(address) external view returns (uint256)',
  'function totalActivities() external view returns (uint256)',
  'function getUserStats(address) external view returns (uint256, uint256)',
  'event ActivityRecorded(address indexed user, uint256 timestamp, bytes32 activityType)',
]);

interface DashboardConfig {
  contractAddress: string;
  walletAddress: string;
  refreshInterval?: number;
}

interface Stats {
  totalActivities: number;
  lastActivity: Date | null;
  timeSinceLastActivity: string;
  balance: string;
  estimatedDailyGas: string;
}

interface Transaction {
  hash: string;
  timestamp: Date;
  type: string;
  gasUsed: string;
  gasCost: string;
}

interface BuilderScore {
  score: number;
  rank: number;
  rewards: string;
  weeklyRank: number;
}

class ActivityDashboard {
  private config: DashboardConfig;
  private client: any;
  private transactions: Transaction[] = [];
  private stats: Stats | null = null;
  private builderScore: BuilderScore | null = null;

  constructor(config: DashboardConfig) {
    this.config = config;
    this.client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });
  }

  /**
   * Start the dashboard
   */
  async start() {
    console.clear();
    this.printHeader();

    // Initial load
    await this.refresh();

    // Auto-refresh
    const interval = this.config.refreshInterval || 30000; // 30 seconds
    setInterval(() => this.refresh(), interval);
  }

  /**
   * Refresh all data
   */
  private async refresh() {
    await Promise.all([
      this.fetchContractStats(),
      this.fetchRecentTransactions(),
      this.fetchBuilderScore(),
    ]);

    this.render();
  }

  /**
   * Fetch contract statistics
   */
  private async fetchContractStats() {
    try {
      const [activityCount, lastActivityTimestamp] = await this.client.readContract({
        address: this.config.contractAddress as Address,
        abi: ACTIVITY_ABI,
        functionName: 'getUserStats',
        args: [this.config.walletAddress as Address],
      });

      const balance = await this.client.getBalance({
        address: this.config.walletAddress as Address,
      });

      const lastActivity = lastActivityTimestamp > 0
        ? new Date(Number(lastActivityTimestamp) * 1000)
        : null;

      const timeSinceLastActivity = lastActivity
        ? this.formatTimeSince(lastActivity)
        : 'Never';

      // Estimate daily gas cost (20 tx/day * ~0.000001 ETH avg)
      const estimatedDailyGas = '0.00002'; // ~$0.06/day at $3000 ETH

      this.stats = {
        totalActivities: Number(activityCount),
        lastActivity,
        timeSinceLastActivity,
        balance: formatEther(balance),
        estimatedDailyGas,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  /**
   * Fetch recent transactions from Basescan
   */
  private async fetchRecentTransactions() {
    try {
      // Note: In production, this would call Basescan API
      // For now, we'll simulate with contract events

      const logs = await this.client.getLogs({
        address: this.config.contractAddress as Address,
        event: ACTIVITY_ABI.find(x => x.type === 'event'),
        args: {
          user: this.config.walletAddress as Address,
        },
        fromBlock: 'latest',
        toBlock: 'latest',
      });

      // Just keep last 10 transactions in memory
      if (this.transactions.length > 10) {
        this.transactions = this.transactions.slice(0, 10);
      }
    } catch (error) {
      // Silently fail, transactions are optional
    }
  }

  /**
   * Fetch Builder Score from Base Builder Rewards
   */
  private async fetchBuilderScore() {
    try {
      // Note: This would call the actual Builder Score API
      // Placeholder for now - you'd need to find the actual API endpoint

      // The leaderboard is on Farcaster/Base Builder Rewards
      // We'll need to find if there's a public API for this

      this.builderScore = {
        score: 0, // Would be fetched from API
        rank: 0,
        rewards: '0 $WCT',
        weeklyRank: 0,
      };
    } catch (error) {
      // Silently fail, builder score is optional
    }
  }

  /**
   * Render the dashboard
   */
  private render() {
    console.clear();
    this.printHeader();
    console.log('');
    this.printStats();
    console.log('');
    this.printBuilderScore();
    console.log('');
    this.printRecentActivity();
    console.log('');
    this.printFooter();
  }

  /**
   * Print header
   */
  private printHeader() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║          🤖 ACTIVITY GENERATOR DASHBOARD                          ║');
    console.log('║          Base Mainnet - Real-time Monitoring                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
  }

  /**
   * Print statistics
   */
  private printStats() {
    if (!this.stats) {
      console.log('⏳ Loading statistics...');
      return;
    }

    console.log('📊 CONTRACT STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Contract:        ${this.shortenAddress(this.config.contractAddress)}`);
    console.log(`   Wallet:          ${this.shortenAddress(this.config.walletAddress)}`);
    console.log(`   Total Activities: ${this.stats.totalActivities}`);
    console.log(`   Last Activity:    ${this.stats.timeSinceLastActivity}`);
    console.log(`   Wallet Balance:   ${parseFloat(this.stats.balance).toFixed(6)} ETH`);
    console.log(`   Est. Daily Cost:  ${this.stats.estimatedDailyGas} ETH (~$0.06)`);

    // Calculate days remaining
    const balance = parseFloat(this.stats.balance);
    const dailyCost = parseFloat(this.stats.estimatedDailyGas);
    const daysRemaining = Math.floor(balance / dailyCost);
    console.log(`   Days Remaining:   ~${daysRemaining} days`);
  }

  /**
   * Print Builder Score
   */
  private printBuilderScore() {
    console.log('🏆 BASE BUILDER REWARDS LEADERBOARD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!this.builderScore) {
      console.log('   ⚠️  Leaderboard data not available');
      console.log('   💡 Check manually: https://builderscore.xyz');
      console.log('');
      console.log('   📱 Farcaster Mini App: Base Builder Rewards');
      console.log('   🔗 Your activity is being tracked on-chain!');
      return;
    }

    console.log(`   Builder Score:    ${this.builderScore.score}`);
    console.log(`   Current Rank:     #${this.builderScore.rank}`);
    console.log(`   Weekly Rank:      #${this.builderScore.weeklyRank}`);
    console.log(`   Rewards Earned:   ${this.builderScore.rewards}`);
  }

  /**
   * Print recent activity
   */
  private printRecentActivity() {
    console.log('📝 RECENT ACTIVITY (LIVE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.transactions.length === 0) {
      console.log('   No recent transactions. Bot may be starting up...');
      console.log('');
      console.log('   💡 Check PM2 logs: pm2 logs activity-bot');
      return;
    }

    this.transactions.forEach((tx, i) => {
      console.log(`   ${i + 1}. ${tx.type.padEnd(15)} ${tx.timestamp.toLocaleTimeString()} - ${tx.hash.slice(0, 10)}...`);
    });
  }

  /**
   * Print footer
   */
  private printFooter() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Auto-refreshing every ${(this.config.refreshInterval || 30000) / 1000}s`);
    console.log('🔗 Basescan: https://basescan.org/address/' + this.config.contractAddress);
    console.log('🏆 Leaderboard: https://builderscore.xyz');
    console.log('');
    console.log('Press Ctrl+C to exit');
  }

  /**
   * Format time since
   */
  private formatTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  /**
   * Shorten address
   */
  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Main execution
async function main() {
  const contractAddress = process.env.ACTIVITY_CONTRACT_ADDRESS;
  const walletAddress = process.env.WALLET_ADDRESS || process.env.PRIVATE_KEY;

  if (!contractAddress) {
    console.error('❌ Error: ACTIVITY_CONTRACT_ADDRESS not set');
    console.error('Set it in your .env file');
    process.exit(1);
  }

  if (!walletAddress) {
    console.error('❌ Error: WALLET_ADDRESS not set');
    console.error('Set it in your .env file or it will be derived from PRIVATE_KEY');
    process.exit(1);
  }

  // If wallet address is a private key, derive the address
  let actualWalletAddress = walletAddress;
  if (walletAddress.length === 64 || walletAddress.startsWith('0x') && walletAddress.length === 66) {
    const { privateKeyToAccount } = await import('viem/accounts');
    const account = privateKeyToAccount(walletAddress.startsWith('0x') ? walletAddress as `0x${string}` : `0x${walletAddress}` as `0x${string}`);
    actualWalletAddress = account.address;
  }

  const config: DashboardConfig = {
    contractAddress,
    walletAddress: actualWalletAddress,
    refreshInterval: 30000, // 30 seconds
  };

  const dashboard = new ActivityDashboard(config);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Dashboard stopped');
    process.exit(0);
  });

  await dashboard.start();
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { ActivityDashboard, type DashboardConfig };
