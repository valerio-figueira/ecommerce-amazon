import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(monorepoRoot, '.env') });

const devOrigins =
  process.env['NEXT_ALLOWED_DEV_ORIGINS']
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

const siteName =
  process.env['SITE_NAME']?.trim() || process.env['NEXT_PUBLIC_SITE_NAME']?.trim() || 'Vitrine';
const siteUrl =
  process.env['WEB_PUBLIC_URL']?.trim() ||
  process.env['NEXT_PUBLIC_SITE_URL']?.trim() ||
  `http://localhost:${process.env['WEB_PORT'] ?? '3001'}`;

// Production Swarm serves admin at admin.{dominio} (sem basePath); fase IP usa /admin via ADMIN_BASE_PATH.
const adminBasePath = process.env['ADMIN_BASE_PATH']?.trim() ?? '';

const nextConfig: NextConfig = {
  ...(adminBasePath ? { basePath: adminBasePath } : {}),
  output: 'standalone',
  // Lint runs in GitHub Actions quality job; Docker build must not duplicate it.
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', ...devOrigins],
  env: {
    NEXT_PUBLIC_SITE_NAME: siteName,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
