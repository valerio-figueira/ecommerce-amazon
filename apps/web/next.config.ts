import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(monorepoRoot, '.env') });

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
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  async rewrites() {
    const apiUrl =
      process.env['API_INTERNAL_URL'] ??
      process.env['NEXT_PUBLIC_API_URL'] ??
      'http://localhost:3000';
    return [
      {
        source: '/go/:slug',
        destination: `${apiUrl}/go/:slug`,
      },
    ];
  },
};

export default nextConfig;
