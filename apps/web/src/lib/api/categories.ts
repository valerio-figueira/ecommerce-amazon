import { apiFetchParsed, getApiUrl } from '@/lib/api/client';
import { categoriesResponseSchema, type CategoryTreeNodeDto } from '@/lib/api/schemas';

export async function fetchCategoryTree(): Promise<CategoryTreeNodeDto[]> {
  const result = await apiFetchParsed('/categories', categoriesResponseSchema, {
    next: { revalidate: 600 },
  });
  return result.items;
}

export function getCategoryNavItems(categories: CategoryTreeNodeDto[]) {
  return categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    ...(category.subcategories?.length
      ? {
          children: category.subcategories.map((child) => ({
            slug: child.slug,
            label: child.label,
          })),
        }
      : {}),
  }));
}

export { getApiUrl };
