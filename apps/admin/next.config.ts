import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const siteName =
  normalizeBrandEnvValue(process.env['SITE_NAME']) ??
  normalizeBrandEnvValue(process.env['NEXT_PUBLIC_SITE_NAME']) ??
  'Vitrine';
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
