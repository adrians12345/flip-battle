/**
 * WalletKit Integration for enhanced wallet features
 * Uses @reown/walletkit for advanced WalletConnect functionality
 */
import { Core } from '@walletconnect/core';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import { getSdkError } from '@walletconnect/utils';
import type { SessionTypes } from '@walletconnect/types';

export class WalletKitService {
  private web3wallet: IWeb3Wallet | null = null;
  private core: Core | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Core
      this.core = new Core({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      });

      // Create Web3Wallet instance
      this.web3wallet = await Web3Wallet.init({
        core: this.core,
        metadata: {
          name: 'Flip Battle',
          description: 'Provably fair coin flip betting on Base',
          url: 'https://flipbattle.xyz',
          icons: ['https://flipbattle.xyz/icon.png'],
        },
      });

      this.setupEventListeners();
      this.isInitialized = true;

      console.log('WalletKit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WalletKit:', error);
    }
  }

  private setupEventListeners() {
    if (!this.web3wallet) return;

    // Session proposal handler
    this.web3wallet.on('session_proposal', async (proposal) => {
      console.log('Session proposal received:', proposal);
    });

    // Session request handler
    this.web3wallet.on('session_request', async (requestEvent) => {
      console.log('Session request received:', requestEvent);
    });

    // Session delete handler
    this.web3wallet.on('session_delete', (session) => {
      console.log('Session deleted:', session);
    });
  }

  async pair(uri: string) {
    if (!this.core) {
      throw new Error('WalletKit not initialized');
    }

    try {
      await this.core.pairing.pair({ uri });
      console.log('Pairing successful');
    } catch (error) {
      console.error('Pairing failed:', error);
      throw error;
    }
  }

  async approveSession(proposal: any, chainId: string, address: string) {
    if (!this.web3wallet) {
      throw new Error('WalletKit not initialized');
    }

    try {
      const session = await this.web3wallet.approveSession({
        id: proposal.id,
        namespaces: {
          eip155: {
            accounts: [`eip155:${chainId}:${address}`],
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
            ],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      console.log('Session approved:', session);
      return session;
    } catch (error) {
      console.error('Session approval failed:', error);
      throw error;
    }
  }

  async rejectSession(proposalId: number) {
    if (!this.web3wallet) {
      throw new Error('WalletKit not initialized');
    }

    try {
      await this.web3wallet.rejectSession({
        id: proposalId,
        reason: getSdkError('USER_REJECTED'),
      });
      console.log('Session rejected');
    } catch (error) {
      console.error('Session rejection failed:', error);
      throw error;
    }
  }

  getActiveSessions(): Record<string, SessionTypes.Struct> {
    if (!this.web3wallet) {
      return {};
    }
    return this.web3wallet.getActiveSessions();
  }

  async disconnectSession(topic: string) {
    if (!this.web3wallet) {
      throw new Error('WalletKit not initialized');
    }

    try {
      await this.web3wallet.disconnectSession({
        topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      console.log('Session disconnected');
    } catch (error) {
      console.error('Session disconnection failed:', error);
      throw error;
    }
  }
}

// Singleton instance
export const walletKitService = new WalletKitService();
