import type { NextConfig } from 'next';

const devOrigins = process.env['NEXT_ALLOWED_DEV_ORIGINS']
  ?.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0) ?? [];

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost', '127.0.0.1', ...devOrigins],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;
