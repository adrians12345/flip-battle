import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Activity Generator Dashboard',
  description: 'Real-time monitoring for Base mainnet activity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
