'use client';

/**
 * Web3Inbox Integration for WalletConnect Notifications
 * Provides push notification capabilities for game events
 */
import { ReactNode } from 'react';
import { Web3InboxProvider as W3IProvider } from '@web3inbox/react';

interface Web3InboxProviderProps {
  children: ReactNode;
}

export function Web3InboxProvider({ children }: Web3InboxProviderProps) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

  if (!projectId) {
    console.warn('WalletConnect Project ID not set for Web3Inbox');
    return <>{children}</>;
  }

  return (
    <W3IProvider
      projectId={projectId}
      domain={typeof window !== 'undefined' ? window.location.host : 'flipbattle.xyz'}
      allApps={true}
    >
      {children}
    </W3IProvider>
  );
}
