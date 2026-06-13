import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';

import { apiFetchParsed, getApiUrl } from '@/lib/api/client';
import { categoriesResponseSchema, type CategoryTreeNodeDto } from '@/lib/api/schemas';

export async function fetchCategoryTree(): Promise<CategoryTreeNodeDto[]> {
  const result = await apiFetchParsed('/categories', categoriesResponseSchema, {
    next: { revalidate: 600 },
  });
  return result.items;
}

export async function fetchCategoryNavTree(): Promise<CategoryNavNode[]> {
  try {
    const tree = await fetchCategoryTree();
    return tree.map(toCategoryNavNode);
  } catch {
    return [];
  }
}

function toCategoryNavNode(node: CategoryTreeNodeDto): CategoryNavNode {
  return {
    slug: node.slug,
    label: node.label,
    icon: node.icon,
    productCount: node.productCount,
    ...(node.subcategories?.length
      ? { subcategories: node.subcategories.map(toCategoryNavNode) }
      : {}),
  };
}

export { getApiUrl };
