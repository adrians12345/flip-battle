'use client';

import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect } from 'react';
import { walletConnectAnalytics } from '@/lib/analytics';
import { shortenAddress } from '@/lib/walletconnect-utils';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  // Track wallet connection/disconnection
  useEffect(() => {
    if (isConnected && address) {
      walletConnectAnalytics.trackWalletConnection(address, chainId);
    }
  }, [isConnected, address, chainId]);

  const handleDisconnect = () => {
    if (address) {
      walletConnectAnalytics.trackWalletDisconnection(address);
    }
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-mono">
          {shortenAddress(address)}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 border border-gray-700 rounded-lg font-semibold btn-hover"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold btn-hover"
    >
      Connect Wallet
    </button>
  );
}
