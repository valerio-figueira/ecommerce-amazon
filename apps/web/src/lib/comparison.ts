import type { ProductDetailDto } from '@/lib/api/schemas';

export function parseComparisonSlugs(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw.join(',') : raw;
  if (!value) return [];
  return value
    .split(',')
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0);
}

export function isValidComparisonSlugCount(count: number): boolean {
  return count >= 2 && count <= 3;
}

export function resolveComparisonCategoryKey(product: ProductDetailDto): string {
  return product.categoryId ?? product.category?.slug ?? '__none__';
}

export function productsShareCategory(products: ProductDetailDto[]): boolean {
  if (products.length === 0) return false;
  const keys = products.map(resolveComparisonCategoryKey);
  return new Set(keys).size === 1;
}

export function resolveComparisonCategoryLabel(products: ProductDetailDto[]): string | undefined {
  const first = products[0];
  if (!first) return undefined;
  return first.category?.label ?? first.categoryLabel;
}
