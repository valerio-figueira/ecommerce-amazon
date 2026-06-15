import { buildNextImageRemotePatterns } from '@ecommerce-amazon/shared/next-image';

const storagePublicBaseUrl =
  process.env['NEXT_PUBLIC_STORAGE_PUBLIC_BASE_URL'] ??
  process.env['STORAGE_PUBLIC_BASE_URL'] ??
  `${(process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000').replace(/\/+$/, '')}/uploads`;

export const WEB_IMAGE_REMOTE_PATTERNS = buildNextImageRemotePatterns({
  NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
  STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl,
  API_INTERNAL_URL: process.env['API_INTERNAL_URL'],
  NEXT_ALLOWED_DEV_ORIGINS: process.env['NEXT_ALLOWED_DEV_ORIGINS'],
});
