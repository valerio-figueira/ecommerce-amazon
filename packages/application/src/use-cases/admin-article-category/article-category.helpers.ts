import { ConflictError } from '@ecommerce-amazon/domain';
import type { ArticleCategoryRepository } from '@ecommerce-amazon/domain';

export async function assertUniqueArticleCategorySlug(
  repository: ArticleCategoryRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await repository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError('Article category slug already exists');
  }
}
