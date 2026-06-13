import { normalizeSiteBaseUrl } from '@ecommerce-amazon/shared/seo';

const DEFAULT_SITE_URL = 'http://localhost:3001';

export function getSiteBaseUrl(): string {
  return normalizeSiteBaseUrl(process.env['NEXT_PUBLIC_SITE_URL'] ?? DEFAULT_SITE_URL);
}
