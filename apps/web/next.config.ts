import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildWebNextImageRemotePatterns } from './next-image-config';
import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: path.join(monorepoRoot, '.env') });

/** Keep in sync with @ecommerce-amazon/shared/config/brand — next.config cannot import workspace packages. */
function normalizeBrandEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;
  return unquoted.replace(/\\([\\'"$` \n\r\t])/g, '$1');
}

const devOrigins =
  process.env['NEXT_ALLOWED_DEV_ORIGINS']
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

function nonEmptyEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
}

const apiPublicUrl = nonEmptyEnv('NEXT_PUBLIC_API_URL') ?? 'http://localhost:3000';

const storagePublicBaseUrl =
  nonEmptyEnv('STORAGE_PUBLIC_BASE_URL') ?? `${apiPublicUrl.replace(/\/+$/, '')}/uploads`;

const siteName =
  normalizeBrandEnvValue(nonEmptyEnv('SITE_NAME')) ??
  normalizeBrandEnvValue(nonEmptyEnv('NEXT_PUBLIC_SITE_NAME')) ??
  'Vitrine';
const siteUrl =
  nonEmptyEnv('WEB_PUBLIC_URL') ??
  nonEmptyEnv('NEXT_PUBLIC_SITE_URL') ??
  `http://localhost:${process.env['WEB_PORT'] ?? '3001'}`;

const nextConfig: NextConfig = {
  output: 'standalone',
  // Lint and app typecheck run in CI/pre-commit (eslint + typecheck:apps).
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', ...devOrigins],
  env: {
    NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl,
    NEXT_PUBLIC_SITE_NAME: siteName,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    remotePatterns: buildWebNextImageRemotePatterns({
      NEXT_PUBLIC_API_URL: apiPublicUrl,
      STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl,
      API_INTERNAL_URL: nonEmptyEnv('API_INTERNAL_URL'),
      NEXT_ALLOWED_DEV_ORIGINS: process.env['NEXT_ALLOWED_DEV_ORIGINS'],
    }),
  },
  async rewrites() {
    const apiUrl = nonEmptyEnv('API_INTERNAL_URL') ?? apiPublicUrl;
    return Promise.resolve([
      {
        source: '/go/:slug',
        destination: `${apiUrl}/go/:slug`,
      },
    ]);
  },
};

export default nextConfig;
