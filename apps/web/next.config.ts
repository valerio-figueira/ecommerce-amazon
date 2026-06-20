import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildWebNextImageRemotePatterns } from './next-image-config';
import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(monorepoRoot, '.env') });

const devOrigins = process.env['NEXT_ALLOWED_DEV_ORIGINS']
  ?.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0) ?? [];

const storagePublicBaseUrl =
  process.env['STORAGE_PUBLIC_BASE_URL'] ??
  `${(process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000').replace(/\/+$/, '')}/uploads`;

const siteName = process.env['SITE_NAME'] ?? process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Vitrine';
const siteUrl =
  process.env['WEB_PUBLIC_URL'] ??
  process.env['NEXT_PUBLIC_SITE_URL'] ??
  `http://localhost:${process.env['WEB_PORT'] ?? '3001'}`;

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost', '127.0.0.1', ...devOrigins],
  env: {
    NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl,
    NEXT_PUBLIC_SITE_NAME: siteName,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    remotePatterns: buildWebNextImageRemotePatterns({
      NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
      STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl,
      API_INTERNAL_URL: process.env['API_INTERNAL_URL'],
      NEXT_ALLOWED_DEV_ORIGINS: process.env['NEXT_ALLOWED_DEV_ORIGINS'],
    }),
  },
  rewrites() {
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
