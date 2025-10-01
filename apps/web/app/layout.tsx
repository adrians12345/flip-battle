import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from './components/Web3Provider';
import { AutoCast } from './components/AutoCast';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { config } from './lib/web3';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flip Battle | Provably Fair Coin Flips on Base',
  description: 'Challenge friends to provably fair coin flips. Built on Base with Chainlink VRF. Earn rewards through streaks and referrals.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://flipbattle.xyz'),
  openGraph: {
    title: 'Flip Battle',
    description: 'Provably fair coin flip betting on Base',
    url: 'https://flipbattle.xyz',
    siteName: 'Flip Battle',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Flip Battle',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flip Battle',
    description: 'Provably fair coin flip betting on Base',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://flipbattle.xyz/og-image.png',
    'fc:frame:button:1': 'Play Flip Battle',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://flipbattle.xyz',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, (await headers()).get('cookie'));

  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider initialState={initialState}>
          {children}
          <AutoCast />
        </Web3Provider>
      </body>
    </html>
  );
}
