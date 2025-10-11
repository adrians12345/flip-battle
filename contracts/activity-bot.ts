#!/usr/bin/env bun

/**
 * Automated Activity Generator Bot for Base Mainnet
 * Generates consistent onchain activity using WalletConnect libraries
 * Date: October 11, 2025
 */

import { createWalletClient, http, publicActions, parseAbi, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Configuration
interface BotConfig {
  privateKey: string;
  contractAddress: string;
  minDelayMinutes: number;
  maxDelayMinutes: number;
  transactionsPerDay: number;
}

const ACTIVITY_ABI = parseAbi([
  'function recordActivity() external',
  'function storeMessage(string calldata message) external',
  'function pingContract() external',
  'function batchRecordActivity(uint256 count) external',
  'function getActivityStats(address user) external view returns (uint256 count, uint256 timestamp)',
]);

class ActivityBot {
  private config: BotConfig;
  private account: ReturnType<typeof privateKeyToAccount>;
  private client: any;
  private running: boolean = false;
  private activityCount: number = 0;

  constructor(config: BotConfig) {
    this.config = config;
    this.account = privateKeyToAccount(config.privateKey as `0x${string}`);

    this.client = createWalletClient({
      account: this.account,
      chain: base,
      transport: http('https://mainnet.base.org'),
    }).extend(publicActions);

    console.log('Bot initialized');
    console.log('Address:', this.account.address);
    console.log('Contract:', config.contractAddress);
  }

  /**
   * Start the bot
   */
  async start() {
    console.log('\n🤖 Starting Activity Bot...');
    console.log(`📊 Target: ${this.config.transactionsPerDay} transactions/day`);
    console.log(`⏱️  Delay: ${this.config.minDelayMinutes}-${this.config.maxDelayMinutes} minutes\n`);

    this.running = true;

    // Initial stats check
    await this.checkStats();

    while (this.running) {
      try {
        await this.generateActivity();

        const delay = this.calculateDelay();
        const delayMinutes = (delay / 1000 / 60).toFixed(1);
        console.log(`⏰ Next activity in ${delayMinutes} minutes...\n`);

        await this.sleep(delay);
      } catch (error) {
        console.error('❌ Error:', error);
        console.log('⏰ Waiting 5 minutes before retry...\n');
        await this.sleep(5 * 60 * 1000);
      }
    }
  }

  /**
   * Stop the bot
   */
  stop() {
    console.log('\n🛑 Stopping bot...');
    this.running = false;
  }

  /**
   * Check current stats
   */
  private async checkStats() {
    try {
      const stats = await this.client.readContract({
        address: this.config.contractAddress as Address,
        abi: ACTIVITY_ABI,
        functionName: 'getActivityStats',
        args: [this.account.address],
      });

      console.log('📈 Current Stats:');
      console.log(`   Total Activities: ${stats[0]}`);
      console.log(`   Last Activity: ${new Date(Number(stats[1]) * 1000).toLocaleString()}`);
      console.log('');
    } catch (error) {
      console.log('⚠️  Could not fetch stats (contract may not be deployed yet)\n');
    }
  }

  /**
   * Generate a single activity
   */
  private async generateActivity() {
    const activityType = this.selectActivityType();
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] 🎯 Generating: ${activityType}`);

    let hash: string;

    switch (activityType) {
      case 'RECORD':
        hash = await this.recordActivity();
        break;
      case 'MESSAGE':
        hash = await this.storeMessage();
        break;
      case 'PING':
        hash = await this.pingContract();
        break;
      case 'BATCH':
        hash = await this.batchActivity();
        break;
      default:
        hash = await this.recordActivity();
    }

    this.activityCount++;
    console.log(`✅ Transaction: ${hash}`);
    console.log(`📊 Activity Count: ${this.activityCount}`);
    console.log(`🔗 View: https://basescan.org/tx/${hash}`);
  }

  /**
   * Record simple activity
   */
  private async recordActivity(): Promise<string> {
    const hash = await this.client.writeContract({
      address: this.config.contractAddress as Address,
      abi: ACTIVITY_ABI,
      functionName: 'recordActivity',
    });

    await this.client.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * Store a message
   */
  private async storeMessage(): Promise<string> {
    const messages = [
      'Building on Base 🔵',
      'GM from Base!',
      'Flip Battle activity',
      'Testing WalletConnect integration',
      'Base Builder Rewards',
      'Onchain activity generation',
      'Automated transactions',
      'Smart contract interaction',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    const hash = await this.client.writeContract({
      address: this.config.contractAddress as Address,
      abi: ACTIVITY_ABI,
      functionName: 'storeMessage',
      args: [message],
    });

    await this.client.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * Ping contract
   */
  private async pingContract(): Promise<string> {
    const hash = await this.client.writeContract({
      address: this.config.contractAddress as Address,
      abi: ACTIVITY_ABI,
      functionName: 'pingContract',
    });

    await this.client.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * Batch activity (more efficient)
   */
  private async batchActivity(): Promise<string> {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 activities

    const hash = await this.client.writeContract({
      address: this.config.contractAddress as Address,
      abi: ACTIVITY_ABI,
      functionName: 'batchRecordActivity',
      args: [BigInt(count)],
    });

    await this.client.waitForTransactionReceipt({ hash });
    return hash;
  }

  /**
   * Select activity type with weighted randomness
   */
  private selectActivityType(): string {
    const rand = Math.random();

    if (rand < 0.4) return 'RECORD';
    if (rand < 0.6) return 'MESSAGE';
    if (rand < 0.8) return 'PING';
    return 'BATCH';
  }

  /**
   * Calculate random delay
   */
  private calculateDelay(): number {
    const minMs = this.config.minDelayMinutes * 60 * 1000;
    const maxMs = this.config.maxDelayMinutes * 60 * 1000;
    return Math.floor(Math.random() * (maxMs - minMs) + minMs);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get statistics
   */
  getStats() {
    const avgDelay = (this.config.minDelayMinutes + this.config.maxDelayMinutes) / 2;
    const estimatedTxPerDay = Math.floor((24 * 60) / avgDelay);

    return {
      address: this.account.address,
      contract: this.config.contractAddress,
      targetTxPerDay: this.config.transactionsPerDay,
      estimatedTxPerDay,
      avgDelayMinutes: avgDelay,
      currentCount: this.activityCount,
    };
  }
}

// Main execution
async function main() {
  // Load environment variables
  const privateKey = process.env.PRIVATE_KEY || process.env.ACTIVITY_PRIVATE_KEY;
  const contractAddress = process.env.ACTIVITY_CONTRACT_ADDRESS;

  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY or ACTIVITY_PRIVATE_KEY not set');
    console.error('Set it in your environment or .env file');
    process.exit(1);
  }

  if (!contractAddress) {
    console.error('❌ Error: ACTIVITY_CONTRACT_ADDRESS not set');
    console.error('Deploy the ActivityGenerator contract first, then set this variable');
    process.exit(1);
  }

  // Configuration
  const config: BotConfig = {
    privateKey,
    contractAddress,
    minDelayMinutes: 30,  // 30 minutes minimum
    maxDelayMinutes: 90,  // 90 minutes maximum
    transactionsPerDay: 20, // Target ~20 transactions per day
  };

  const bot = new ActivityBot(config);

  console.log('📊 Bot Configuration:');
  console.log(JSON.stringify(bot.getStats(), null, 2));
  console.log('');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
    bot.stop();
    process.exit(0);
  });

  // Start bot
  await bot.start();
}

// Run if executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { ActivityBot, type BotConfig };
