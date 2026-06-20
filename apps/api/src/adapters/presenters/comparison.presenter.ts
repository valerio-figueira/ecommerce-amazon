import type { Product, ProductComparison } from '@ecommerce-amazon/domain';

import {
  toProductDetailDto,
  toProductListItemDto,
  type ProductDetailDto,
  type ProductListItemDto,
} from './product.presenter.js';

export type ComparisonPresenterInput = {
  comparison: ProductComparison;
  products: Product[];
  relatedProducts: Product[];
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
};

export type ComparisonPublicDetailDto = {
  shareToken: string;
  slug?: string | undefined;
  status: string;
  source?: string | undefined;
  editorialIntro: string;
  createdAt: string;
  updatedAt?: string | undefined;
  publishedAt?: string | undefined;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  showCategoryCarousel: boolean;
  canonicalPath: string;
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
  relatedProducts?: ProductListItemDto[] | undefined;
  products: ProductDetailDto[];
};

export function toComparisonPublicDto(
  result: ComparisonPresenterInput,
  categoriesById: Map<string, { id: string; slug: string; label: string }> = new Map(),
): ComparisonPublicDetailDto {
  const { comparison, products, relatedProducts, categorySlug, categoryLabel } = result;

  const relatedDtos =
    relatedProducts.length > 0
      ? relatedProducts.map((product) => {
          const category = product.categoryId ? categoriesById.get(product.categoryId) : undefined;
          return toProductListItemDto(product, category);
        })
      : undefined;

  return {
    shareToken: comparison.shareToken,
    slug: comparison.slug,
    status: comparison.status,
    source: comparison.source,
    editorialIntro: comparison.editorialIntro,
    createdAt: comparison.createdAt.toISOString(),
    updatedAt: comparison.updatedAt.toISOString(),
    publishedAt: comparison.publishedAt?.toISOString(),
    seoTitle: comparison.seoTitle,
    seoDescription: comparison.seoDescription,
    showCategoryCarousel: comparison.showCategoryCarousel,
    canonicalPath: comparison.canonicalPath(),
    categorySlug,
    categoryLabel,
    relatedProducts: relatedDtos,
    products: products.map((product) => {
      const category = product.categoryId ? categoriesById.get(product.categoryId) : undefined;
      return {
        ...toProductDetailDto(product),
        ...(category
          ? { categorySlug: category.slug, categoryLabel: category.label, categoryId: category.id }
          : {}),
      };
    }),
  };
}

export function toComparisonPublicDtoLegacy(
  comparison: ProductComparison,
  products: Product[],
): ComparisonPublicDetailDto {
  return toComparisonPublicDto({
    comparison,
    products,
    relatedProducts: [],
    categorySlug: undefined,
    categoryLabel: undefined,
  });
}
