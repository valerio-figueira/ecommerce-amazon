import { unstable_cache } from 'next/cache';

import type { CategoryNavNode } from '@ecommerce-amazon/shared/category/category-tree-nav';
import { PUBLIC_WEB_CACHE_TAGS } from '@ecommerce-amazon/shared/cache';

import { apiFetchParsed, getApiUrl } from '@/lib/api/client';
import { categoriesResponseSchema, type CategoryTreeNodeDto } from '@/lib/api/schemas';

async function loadCategoryTree(): Promise<CategoryTreeNodeDto[]> {
  const result = await apiFetchParsed('/categories', categoriesResponseSchema, {
    next: { revalidate: 600, tags: [PUBLIC_WEB_CACHE_TAGS.categoryNavTree] },
  });
  return result.items;
}

export const getCachedCategoryTree = unstable_cache(loadCategoryTree, ['category-tree'], {
  revalidate: 600,
  tags: [PUBLIC_WEB_CACHE_TAGS.categoryNavTree],
});

/** Header nav — errors are not cached (fallback empty only on this request). */
export async function fetchCategoryNavTreeForHeader(): Promise<CategoryNavNode[]> {
  try {
    const tree = await getCachedCategoryTree();
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
