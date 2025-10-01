'use client';

import { useEffect, useState } from 'react';
import { getFarcasterUserByAddress, formatFarcasterUsername, getFarcasterProfileImage } from '@/lib/neynar';
import { Address } from 'viem';

interface FarcasterProfileProps {
  address: Address;
  showAvatar?: boolean;
  showUsername?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FarcasterProfile({
  address,
  showAvatar = true,
  showUsername = true,
  size = 'md'
}: FarcasterProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarcasterUser() {
      setLoading(true);
      const farcasterUser = await getFarcasterUserByAddress(address);
      setUser(farcasterUser);
      setLoading(false);
    }

    if (address) {
      loadFarcasterUser();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div className={`rounded-full bg-gray-700 animate-pulse ${
            size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
          }`} />
        )}
        {showUsername && (
          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div className={`rounded-full bg-gray-800 flex items-center justify-center ${
            size === 'sm' ? 'w-6 h-6 text-xs' : size === 'md' ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'
          }`}>
            👤
          </div>
        )}
        {showUsername && (
          <span className="text-gray-500 font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    );
  }

  const username = formatFarcasterUsername(user);
  const avatarUrl = getFarcasterProfileImage(user);

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <div className={`rounded-full overflow-hidden bg-gray-800 ${
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
        }`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              👤
            </div>
          )}
        </div>
      )}
      {showUsername && username && (
        <span className="font-semibold text-purple-400">
          {username}
        </span>
      )}
    </div>
  );
}
