'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ShareButtonProps {
  text: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({
  text,
  url,
  variant = 'primary',
  size = 'md'
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;

  const handleShare = () => {
    // Open Warpcast compose in new window
    window.open(warpcastUrl, '_blank', 'width=600,height=800');
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700',
    outline: 'border-2 border-purple-600 hover:bg-purple-600/10 text-purple-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      onClick={handleShare}
      className={`rounded-lg font-semibold transition-all shadow-lg ${variantClasses[variant]} ${sizeClasses[size]}`}
      whileTap={{ scale: 0.95 }}
    >
      {shared ? (
        <span className="flex items-center gap-2">
          ✓ Shared!
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
          Share on Farcaster
        </span>
      )}
    </motion.button>
  );
}
