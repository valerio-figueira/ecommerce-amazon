import { ConflictError, type ContentRepository } from '@ecommerce-amazon/domain';

export async function assertUniqueArticleSlug(
  repository: ContentRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await repository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError(`Article slug "${slug}" already exists`);
  }
}
