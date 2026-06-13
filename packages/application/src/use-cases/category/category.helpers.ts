import {
  Category,
  ConflictError,
  EntityNotFoundError,
  MAX_CATEGORY_DEPTH,
  ValidationError,
  type CategoryRepository,
} from '@ecommerce-amazon/domain';

export async function assertCategoryIsLeaf(
  categoryRepository: CategoryRepository,
  categoryId: string,
): Promise<Category> {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new ValidationError('Category not found');
  }
  if (!category.visible) {
    throw new ValidationError('Category is not visible');
  }
  const hasChildren = await categoryRepository.hasChildren(categoryId);
  if (hasChildren) {
    throw new ValidationError('Product must be assigned to a leaf category');
  }
  return category;
}

export async function assertCategoryDepthAllowed(
  categoryRepository: CategoryRepository,
  parentId: string | undefined,
): Promise<void> {
  if (!parentId) return;

  const ancestors = await categoryRepository.getAncestorChain(parentId);
  if (ancestors.length >= MAX_CATEGORY_DEPTH) {
    throw new ValidationError(`Category depth cannot exceed ${MAX_CATEGORY_DEPTH} levels`);
  }
}

export async function assertCategoryNotDescendantOf(
  categoryRepository: CategoryRepository,
  categoryId: string,
  newParentId: string,
): Promise<void> {
  if (categoryId === newParentId) {
    throw new ValidationError('Category cannot be its own parent');
  }

  const descendants = await categoryRepository.getDescendantIds(categoryId);
  if (descendants.includes(newParentId)) {
    throw new ValidationError('Category cannot be moved under its own descendant');
  }
}

export async function assertUniqueCategorySlug(
  categoryRepository: CategoryRepository,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const exists = await categoryRepository.slugExists(slug, excludeId);
  if (exists) {
    throw new ConflictError('Category slug already exists');
  }
}

export async function computeSubtreeProductCounts(
  categoryRepository: CategoryRepository,
  visibleOnly: boolean,
): Promise<Map<string, number>> {
  const categories = await categoryRepository.listAll();
  const directCounts = await categoryRepository.countProductsByCategoryId(visibleOnly);
  const memo = new Map<string, number>();

  function countSubtree(categoryId: string): number {
    const cached = memo.get(categoryId);
    if (cached !== undefined) return cached;

    let total = directCounts.get(categoryId) ?? 0;
    for (const child of categories.filter((item) => item.parentId === categoryId)) {
      total += countSubtree(child.id);
    }

    memo.set(categoryId, total);
    return total;
  }

  for (const category of categories) {
    countSubtree(category.id);
  }

  return memo;
}
