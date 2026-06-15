import { ConflictError, type ContentClusterRepository } from '@ecommerce-amazon/domain';

import { invalidateArticlePublicCache } from '../../cache/public-cache.helpers.js';

export async function assertUniqueContentClusterSlug(
  repository: ContentClusterRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await repository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError('Content cluster slug already exists');
  }
}

export async function invalidateClusterArticleCaches(
  repository: ContentClusterRepository,
  cache: import('@ecommerce-amazon/domain').CacheStore,
  clusterId: string,
): Promise<string[]> {
  const slugs = await repository.listMemberSlugs(clusterId);
  await invalidateArticlePublicCache(cache, slugs);
  return slugs;
}
