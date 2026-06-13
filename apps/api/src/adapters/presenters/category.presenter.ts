import type { Category } from '@ecommerce-amazon/domain';

export type ProductCategorySummaryDto = {
  slug: string;
  label: string;
  breadcrumbs: Array<{ slug: string; label: string }>;
};

export function toProductCategorySummaryDto(
  category: Category,
  ancestors: Category[],
): ProductCategorySummaryDto {
  return {
    slug: category.slug,
    label: category.label,
    breadcrumbs: ancestors.map((item) => ({ slug: item.slug, label: item.label })),
  };
}
