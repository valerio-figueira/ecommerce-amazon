import {
  ComparisonSource,
  ComparisonStatus,
  MIN_CAROUSEL_ITEMS,
  type CategoryRepository,
  type Product,
  type ProductComparison,
  type ProductComparisonRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { isComparisonShareToken } from '@ecommerce-amazon/shared/comparison';

export type ComparisonLoadResult = {
  comparison: ProductComparison;
  products: Product[];
  relatedProducts: Product[];
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
};

export class GetComparisonByIdentifier {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(identifier: string): Promise<ComparisonLoadResult | null> {
    const comparison = isComparisonShareToken(identifier)
      ? await this.comparisonRepository.findByShareToken(identifier)
      : await this.comparisonRepository.findBySlug(identifier);

    if (!comparison) return null;

    const products = await this.productRepository.findByIds(comparison.productIds);
    const productById = new Map(products.map((product) => [String(product.id), product]));
    const orderedProducts = comparison.productIds
      .map((id) => productById.get(id))
      .filter((product): product is Product => product !== undefined);

    const categoryMeta = await this.resolveCategoryMeta(orderedProducts);
    const relatedProducts =
      comparison.isPublished() && comparison.showCategoryCarousel
        ? await this.loadRelatedProducts(comparison.productIds, orderedProducts)
        : [];

    return {
      comparison,
      products: orderedProducts,
      relatedProducts,
      categorySlug: categoryMeta.categorySlug,
      categoryLabel: categoryMeta.categoryLabel,
    };
  }

  private async resolveCategoryMeta(products: Product[]) {
    const firstCategoryId = products.find((product) => product.categoryId)?.categoryId;
    if (!firstCategoryId) {
      return { categorySlug: undefined, categoryLabel: undefined };
    }

    const category = await this.categoryRepository.findById(firstCategoryId);
    if (!category) {
      return { categorySlug: undefined, categoryLabel: undefined };
    }

    return {
      categorySlug: category.slug,
      categoryLabel: category.label,
    };
  }

  private async loadRelatedProducts(
    comparedProductIds: string[],
    orderedProducts: Product[],
  ): Promise<Product[]> {
    const categoryId = orderedProducts.find((product) => product.categoryId)?.categoryId;
    if (!categoryId) return [];

    const excludeProductIds = [...comparedProductIds];
    let items = await this.productRepository.findSimilarPublishedByCategory({
      categoryId,
      excludeProductId: comparedProductIds[0] ?? '',
      excludeProductIds,
      limit: 12,
    });

    if (items.length < MIN_CAROUSEL_ITEMS) {
      const category = await this.categoryRepository.findById(categoryId);
      if (category?.parentId) {
        const parentItems = await this.productRepository.findSimilarPublishedByCategory({
          categoryId: category.parentId,
          excludeProductId: comparedProductIds[0] ?? '',
          excludeProductIds: [...excludeProductIds, ...items.map((item) => item.id)],
          limit: 12,
        });
        const seen = new Set(items.map((item) => item.id));
        for (const item of parentItems) {
          if (seen.has(item.id)) continue;
          items.push(item);
          seen.add(item.id);
          if (items.length >= 12) break;
        }
      }
    }

    return items.length >= MIN_CAROUSEL_ITEMS ? items : [];
  }
}
