import { ValidationError } from '@ecommerce-amazon/domain';

export function normalizeComparisonProductIds(productIds: string[]): string[] {
  return [...productIds].sort();
}

export function assertSameComparisonCategory(
  products: Array<{ id: string; categoryId?: string | undefined }>,
): void {
  if (products.length === 0) {
    throw new ValidationError('Produtos não encontrados para comparação');
  }

  const categoryKeys = products.map((product) => product.categoryId ?? '__none__');
  const unique = new Set(categoryKeys);
  if (unique.size > 1) {
    throw new ValidationError('Só é possível comparar produtos da mesma categoria');
  }
}

export function assertComparisonProductCount(productIds: string[]): void {
  if (productIds.length < 2 || productIds.length > 3) {
    throw new ValidationError('Comparação requer de 2 a 3 produtos');
  }
}
