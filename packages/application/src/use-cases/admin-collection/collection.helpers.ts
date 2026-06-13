import { ConflictError, type CuratedCollectionRepository } from '@ecommerce-amazon/domain';

export async function assertUniqueCollectionSlug(
  repository: CuratedCollectionRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await repository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError(`Collection slug "${slug}" already exists`);
  }
}
