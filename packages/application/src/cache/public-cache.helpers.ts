import type { CacheStore } from '@ecommerce-amazon/domain';
import { articlePublicCacheKey } from '@ecommerce-amazon/shared/cache';

export async function invalidateArticlePublicCache(
  cache: CacheStore,
  slugs: string[],
): Promise<void> {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  await Promise.all(uniqueSlugs.map((slug) => cache.del(articlePublicCacheKey(slug))));
}

export function buildArticlePublicPaths(slugs: string[], options?: { includeListing?: boolean }): string[] {
  const paths = [...new Set(slugs.filter(Boolean).map((slug) => `/artigos/${slug}`))];
  if (options?.includeListing) {
    paths.push('/artigos');
  }
  return paths;
}

export function buildArticleCategoryPublicPaths(
  slugs: string[],
  options?: { includeListing?: boolean },
): string[] {
  const paths = [...new Set(slugs.filter(Boolean).map((slug) => `/artigos/categoria/${slug}`))];
  if (options?.includeListing) {
    paths.push('/artigos');
  }
  return paths;
}

export function buildCmsPagePublicPath(slug: string): string {
  return slug === 'home' ? '/' : `/paginas/${slug}`;
}
