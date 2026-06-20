import type { MetadataRoute } from 'next';

import {
  sitemapEntriesResponseSchema,
  sitemapMetaResponseSchema,
} from '@ecommerce-amazon/shared/seo';

import { apiFetchParsed } from '@/lib/api/client';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 3600;

const STATIC_SITEMAP_PATHS = ['/', '/artigos', '/legal', '/sobre', '/contato'] as const;

async function fetchSitemapMeta(): Promise<{ totalPages: number }> {
  try {
    return await apiFetchParsed('/seo/sitemap-meta', sitemapMetaResponseSchema, {
      next: { revalidate: 3600 },
    });
  } catch {
    return { totalPages: 1 };
  }
}

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  const { totalPages } = await fetchSitemapMeta();
  return Array.from({ length: totalPages }, (_, index) => ({ id: index }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const base = getSiteBaseUrl();
  const page = id + 1;

  try {
    const { items } = await apiFetchParsed(
      `/seo/sitemap-entries?page=${page}`,
      sitemapEntriesResponseSchema,
      { next: { revalidate: 3600 } },
    );

    if (items.length > 0) {
      return items.map((item) => ({
        url: `${base}${item.path}`,
        lastModified: new Date(item.lastModified),
      }));
    }
  } catch {
    // API unavailable at build time — fall back to static routes on first slice only.
  }

  if (page === 1) {
    const now = new Date();
    return STATIC_SITEMAP_PATHS.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
    }));
  }

  return [];
}
