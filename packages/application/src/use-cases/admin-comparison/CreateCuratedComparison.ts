import { randomUUID } from 'node:crypto';

import {
  ComparisonSource,
  ComparisonStatus,
  ProductComparison,
  ValidationError,
  type CategoryRepository,
  type ProductComparisonRepository,
  type ProductRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { CreateAdminComparisonBody } from '@ecommerce-amazon/shared/admin';

import { assertUniqueComparisonSlug } from './comparison.helpers.js';
import {
  assertComparisonProductCount,
  assertSameComparisonCategory,
  normalizeComparisonProductIds,
} from '../comparison/comparison.helpers.js';

export class CreateCuratedComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: CreateAdminComparisonBody): Promise<{ id: string }> {
    assertComparisonProductCount(input.productIds);
    const sortedIds = normalizeComparisonProductIds(input.productIds);
    const products = await this.productRepository.findByIds(sortedIds);

    if (products.length !== sortedIds.length) {
      throw new ValidationError('Um ou mais produtos não foram encontrados');
    }

    assertSameComparisonCategory(products);

    if (input.slug) {
      await assertUniqueComparisonSlug(this.comparisonRepository, input.slug);
    }

    const now = new Date();
    const comparison = ProductComparison.create({
      id: randomUUID(),
      shareToken: randomUUID(),
      sessionId: 'admin-curated',
      productIds: sortedIds,
      editorialIntro: input.editorialIntro.trim(),
      createdAt: now,
      updatedAt: now,
      status: ComparisonStatus.DRAFT,
      source: ComparisonSource.CURATED,
      slug: input.slug,
      seoTitle: input.seoTitle?.trim(),
      seoDescription: input.seoDescription?.trim(),
      showCategoryCarousel: input.showCategoryCarousel ?? true,
    });

    await this.comparisonRepository.save(comparison);
    await this.webRevalidator.revalidate({
      paths: [comparison.canonicalPath(), '/comparacoes'],
    });

    return { id: comparison.id };
  }
}

export class ListAdminComparisons {
  constructor(private readonly comparisonRepository: ProductComparisonRepository) {}

  async execute() {
    const items = await this.comparisonRepository.listAdmin();
    return {
      items: items.map((item) => ({
        id: item.id,
        shareToken: item.shareToken,
        slug: item.slug,
        status: item.status,
        source: item.source,
        productCount: item.productCount,
        productTitles: item.productTitles,
        categoryLabel: item.categoryLabel,
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }
}

export class GetAdminComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string) {
    const comparison = await this.comparisonRepository.findById(id);
    if (!comparison) return null;

    const products = await this.productRepository.findByIds(comparison.productIds);
    const productById = new Map(products.map((product) => [String(product.id), product]));
    const orderedProducts = comparison.productIds
      .map((productId) => productById.get(productId))
      .filter((product): product is NonNullable<typeof product> => product !== undefined);

    const firstCategoryId = orderedProducts.find((product) => product.categoryId)?.categoryId;
    const category = firstCategoryId
      ? await this.categoryRepository.findById(firstCategoryId)
      : null;

    return {
      id: comparison.id,
      shareToken: comparison.shareToken,
      slug: comparison.slug,
      status: comparison.status,
      source: comparison.source,
      editorialIntro: comparison.editorialIntro,
      productIds: comparison.productIds,
      productTitles: orderedProducts.map((product) => product.titleClean),
      categoryLabel: category?.label,
      seoTitle: comparison.seoTitle,
      seoDescription: comparison.seoDescription,
      showCategoryCarousel: comparison.showCategoryCarousel,
      createdAt: comparison.createdAt.toISOString(),
      updatedAt: comparison.updatedAt.toISOString(),
      publishedAt: comparison.publishedAt?.toISOString(),
    };
  }
}
