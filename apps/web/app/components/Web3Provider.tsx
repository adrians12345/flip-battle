'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';

import { config, projectId } from '@/lib/web3';
import { Web3InboxProvider } from '@/providers/Web3InboxProvider';
import { walletKitService } from '@/lib/walletkit';

// Setup queryClient
const queryClient = new QueryClient();

export function Web3Provider({
  children,
  initialState
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Create modal only on client side
    if (projectId) {
      createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: true,
        enableOnramp: true,
        themeMode: 'dark',
        themeVariables: {
          '--w3m-accent': '#1e40af',
          '--w3m-border-radius-master': '8px',
        }
      });

      // Initialize WalletKit service for enhanced features
      walletKitService.initialize().catch(console.error);
    }
  }, []);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <Web3InboxProvider>
          {children}
        </Web3InboxProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
