import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable Turbopack for faster development
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack configuration for Web3 compatibility
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding', '@react-native-async-storage/async-storage');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'ipfs.io'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for Farcaster frame support
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
