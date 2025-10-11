/**
 * WalletConnect Utility Functions
 * Uses @walletconnect/utils for common operations
 */
import { parseUri, getSdkError, getAppMetadata } from '@walletconnect/utils';
import type { ErrorResponse } from '@walletconnect/types';

/**
 * Parse WalletConnect URI
 */
export function parseWalletConnectUri(uri: string) {
  try {
    return parseUri(uri);
  } catch (error) {
    console.error('Failed to parse WalletConnect URI:', error);
    return null;
  }
}

/**
 * Get standard SDK errors for WalletConnect operations
 */
export const WalletConnectErrors = {
  USER_REJECTED: getSdkError('USER_REJECTED'),
  USER_DISCONNECTED: getSdkError('USER_DISCONNECTED'),
  UNAUTHORIZED_METHOD: getSdkError('UNAUTHORIZED_METHOD'),
  UNSUPPORTED_CHAINS: getSdkError('UNSUPPORTED_CHAINS'),
  UNSUPPORTED_METHODS: getSdkError('UNSUPPORTED_METHODS'),
  INVALID_EVENT: getSdkError('INVALID_EVENT'),
};

/**
 * Validate WalletConnect URI format
 */
export function isValidWalletConnectUri(uri: string): boolean {
  try {
    const parsed = parseUri(uri);
    return !!(parsed.protocol && parsed.topic && parsed.version);
  } catch {
    return false;
  }
}

/**
 * Format error response for WalletConnect
 */
export function formatWalletConnectError(error: any): ErrorResponse {
  if (typeof error === 'string') {
    return {
      code: -32000,
      message: error,
    };
  }

  return {
    code: error.code || -32000,
    message: error.message || 'Unknown error occurred',
  };
}

/**
 * Get app metadata for WalletConnect
 */
export function getFlipBattleMetadata() {
  return getAppMetadata() || {
    name: 'Flip Battle',
    description: 'Provably fair coin flip betting on Base',
    url: 'https://flipbattle.xyz',
    icons: ['https://flipbattle.xyz/icon.png'],
  };
}

/**
 * Format chain ID for WalletConnect (CAIP-2 format)
 */
export function formatChainId(chainId: number): string {
  return `eip155:${chainId}`;
}

/**
 * Format account for WalletConnect (CAIP-10 format)
 */
export function formatAccount(chainId: number, address: string): string {
  return `eip155:${chainId}:${address}`;
}

/**
 * Parse CAIP-2 chain ID
 */
export function parseChainId(caipChainId: string): number | null {
  const parts = caipChainId.split(':');
  if (parts.length !== 2 || parts[0] !== 'eip155') {
    return null;
  }
  return parseInt(parts[1], 10);
}

/**
 * Parse CAIP-10 account
 */
export function parseAccount(caipAccount: string): { chainId: number; address: string } | null {
  const parts = caipAccount.split(':');
  if (parts.length !== 3 || parts[0] !== 'eip155') {
    return null;
  }
  return {
    chainId: parseInt(parts[1], 10),
    address: parts[2],
  };
}

/**
 * Generate WalletConnect session namespace for Base
 */
export function getBaseNamespace(address: string, chainId: number = 8453) {
  return {
    eip155: {
      accounts: [formatAccount(chainId, address)],
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v4',
      ],
      events: ['chainChanged', 'accountsChanged'],
      chains: [formatChainId(chainId)],
    },
  };
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convert wei to ETH
 */
export function weiToEth(wei: string | bigint): string {
  const weiAmount = typeof wei === 'string' ? BigInt(wei) : wei;
  return (Number(weiAmount) / 1e18).toFixed(6);
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: string): bigint {
  return BigInt(Math.floor(parseFloat(eth) * 1e18));
}
