import type { MetadataRoute } from 'next';

import { publicSiteSettingsResponseSchema } from '@ecommerce-amazon/shared/admin';

import { getSiteBaseUrl } from '@/lib/site-url';

async function isIndexingBlocked(): Promise<boolean> {
  const apiUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000';

  try {
    const response = await fetch(`${apiUrl}/site-settings/public`, {
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
      disallow: ['/go/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
