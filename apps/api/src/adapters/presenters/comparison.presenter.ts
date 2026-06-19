import type { Product, ProductComparison } from '@ecommerce-amazon/domain';

import {
  toProductDetailDto,
  type ProductDetailDto,
} from './product.presenter.js';

export type ComparisonPublicDetailDto = {
  shareToken: string;
  editorialIntro: string;
  createdAt: string;
  products: ProductDetailDto[];
};

export function toComparisonPublicDto(
  comparison: ProductComparison,
  products: Product[],
): ComparisonPublicDetailDto {
  const productById = new Map(products.map((product) => [String(product.id), product]));
  const orderedProducts = comparison.productIds
    .map((id) => productById.get(id))
    .filter((product): product is Product => product !== undefined);

  return {
    shareToken: comparison.shareToken,
    editorialIntro: comparison.editorialIntro,
    createdAt: comparison.createdAt.toISOString(),
    products: orderedProducts.map(toProductDetailDto),
  };
}
