import { ConflictError, type ProductComparisonRepository } from '@ecommerce-amazon/domain';

export async function assertUniqueComparisonSlug(
  repository: ProductComparisonRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await repository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError(`Comparison slug "${slug}" already exists`);
  }
}
