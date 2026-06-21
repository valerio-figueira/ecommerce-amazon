import type { CacheStore, PublicWebRevalidationOptions } from '@ecommerce-amazon/domain';
import { articlePublicCacheKey, PUBLIC_WEB_CACHE_TAGS } from '@ecommerce-amazon/shared/cache';

export async function invalidateArticlePublicCache(
  cache: CacheStore,
  slugs: string[],
): Promise<void> {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  await Promise.all(uniqueSlugs.map((slug) => cache.del(articlePublicCacheKey(slug))));
}

export function buildArticlePublicPaths(
  slugs: string[],
  options?: { includeListing?: boolean },
): string[] {
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

export function buildCmsPageRevalidationOptions(slug: string): {
  paths: string[];
  layoutPaths?: string[];
} {
  const publicPath = buildCmsPagePublicPath(slug);
  if (slug === 'home') {
    return { paths: [publicPath], layoutPaths: ['/'] };
  }
  return { paths: [publicPath] };
}

export function buildInstitutionalPagePublicPath(slug: string): string {
  if (slug === 'sobre') return '/sobre';
  if (slug === 'contato') return '/contato';
  return `/${slug}`;
}

export function buildCategoryRevalidationOptions(options: {
  paths: string[];
}): PublicWebRevalidationOptions {
  return {
    paths: [...new Set(options.paths)],
    layoutPaths: ['/'],
    tags: [PUBLIC_WEB_CACHE_TAGS.categoryNavTree],
  };
}

export function buildInstitutionalRevalidationOptions(slug: string): PublicWebRevalidationOptions {
  return {
    paths: [buildInstitutionalPagePublicPath(slug)],
    layoutPaths: ['/'],
    tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage(slug)],
  };
}

/** `/sobre` team grid (`GET /team`) — profile bio, avatar, showOnTeam. */
export function buildAboutTeamRevalidationOptions(): PublicWebRevalidationOptions {
  return {
    paths: ['/sobre'],
    layoutPaths: ['/'],
    tags: [PUBLIC_WEB_CACHE_TAGS.publicTeamMembers],
  };
}
