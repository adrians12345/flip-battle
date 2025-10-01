import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'placeholder-project-id';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && typeof window !== 'undefined') {
  console.warn('WalletConnect Project ID is not defined. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file.');
}

const metadata = {
  name: 'Flip Battle',
  description: 'Provably fair coin flip betting on Base',
  url: 'https://flipbattle.xyz',
  icons: ['https://flipbattle.xyz/icon.png']
};

// Determine which chains to use based on environment
const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';
const chains = [isTestnet ? baseSepolia : base, base] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
