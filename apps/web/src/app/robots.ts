import type { MetadataRoute } from 'next';

import { publicSiteSettingsResponseSchema } from '@ecommerce-amazon/shared/admin';

import { resolveApiBaseUrl } from '@/lib/api/resolve-api-base-url';
import { getSiteBaseUrl } from '@/lib/site-url';

async function isIndexingBlocked(): Promise<boolean> {
  try {
    const response = await fetch(`${resolveApiBaseUrl()}/site-settings/public`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return false;
    }

    const payload: unknown = await response.json();
    const parsed = publicSiteSettingsResponseSchema.safeParse(payload);
    return parsed.success ? parsed.data.indexingBlocked : false;
  } catch {
    return false;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = getSiteBaseUrl();
  const indexingBlocked = await isIndexingBlocked();

  if (indexingBlocked) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/go/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
