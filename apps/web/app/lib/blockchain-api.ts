/**
 * WalletConnect Blockchain API Integration
 * Uses @reown/appkit-blockchain-api for enhanced RPC features and transaction history
 */
import { BlockchainApiController } from '@reown/appkit-blockchain-api';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  status: 'success' | 'failed' | 'pending';
}

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  decimals: number;
}

export class BlockchainApiService {
  private projectId: string;
  private baseUrl = 'https://rpc.walletconnect.com/v1';

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
  }

  /**
   * Get transaction history for an address using WalletConnect Blockchain API
   */
  async getTransactionHistory(
    address: string,
    chainId: number = 8453 // Base mainnet
  ): Promise<Transaction[]> {
    if (!this.projectId) {
      console.warn('WalletConnect Project ID not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?projectId=${this.projectId}&address=${address}&chainId=eip155:${chainId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(
    address: string,
    chainId: number = 8453
  ): Promise<TokenBalance[]> {
    if (!this.projectId) {
      console.warn('WalletConnect Project ID not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/balances?projectId=${this.projectId}&address=${address}&chainId=eip155:${chainId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatTokenBalances(data);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      return [];
    }
  }

  /**
   * Get gas price estimation
   */
  async getGasPrice(chainId: number = 8453): Promise<string> {
    if (!this.projectId) {
      console.warn('WalletConnect Project ID not configured');
      return '0';
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/gas-price?projectId=${this.projectId}&chainId=eip155:${chainId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.gasPrice || '0';
    } catch (error) {
      console.error('Failed to fetch gas price:', error);
      return '0';
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveEnsName(ensName: string): Promise<string | null> {
    if (!this.projectId) {
      console.warn('WalletConnect Project ID not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/ens-resolve?projectId=${this.projectId}&name=${ensName}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Failed to resolve ENS name:', error);
      return null;
    }
  }

  /**
   * Get NFTs owned by address
   */
  async getNFTs(address: string, chainId: number = 8453) {
    if (!this.projectId) {
      console.warn('WalletConnect Project ID not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/nfts?projectId=${this.projectId}&address=${address}&chainId=eip155:${chainId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return [];
    }
  }

  private formatTransactions(data: any): Transaction[] {
    if (!data || !Array.isArray(data.transactions)) {
      return [];
    }

    return data.transactions.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timestamp: tx.timestamp,
      blockNumber: tx.blockNumber,
      status: tx.status || 'success',
    }));
  }

  private formatTokenBalances(data: any): TokenBalance[] {
    if (!data || !Array.isArray(data.balances)) {
      return [];
    }

    return data.balances.map((token: any) => ({
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      balance: token.balance,
      decimals: token.decimals || 18,
    }));
  }
}

// Singleton instance
export const blockchainApiService = new BlockchainApiService();
