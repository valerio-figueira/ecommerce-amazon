import {
  ComparisonStatus,
  EntityNotFoundError,
  ProductComparison,
  ValidationError,
  type ProductComparisonRepository,
  type ProductRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { UpdateAdminComparisonBody } from '@ecommerce-amazon/shared/admin';
import { countEditorialWords, MIN_EDITORIAL_WORDS } from '@ecommerce-amazon/shared/comparison';

import { assertUniqueComparisonSlug } from './comparison.helpers.js';
import {
  assertComparisonProductCount,
  assertSameComparisonCategory,
  normalizeComparisonProductIds,
} from '../comparison/comparison.helpers.js';

export class UpdateComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateAdminComparisonBody): Promise<void> {
    const existing = await this.comparisonRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('ProductComparison', id);
    }

    if (input.slug !== undefined && input.slug !== existing.slug) {
      await assertUniqueComparisonSlug(this.comparisonRepository, input.slug, id);
    }

    let productIds = existing.productIds;
    if (input.productIds !== undefined) {
      assertComparisonProductCount(input.productIds);
      const sortedIds = normalizeComparisonProductIds(input.productIds);
      const products = await this.productRepository.findByIds(sortedIds);
      if (products.length !== sortedIds.length) {
        throw new ValidationError('Um ou mais produtos não foram encontrados');
      }
      assertSameComparisonCategory(products);
      productIds = sortedIds;
    }

    const updated = ProductComparison.create({
      id: existing.id,
      shareToken: existing.shareToken,
      sessionId: existing.sessionId,
      productIds,
      editorialIntro: input.editorialIntro?.trim() ?? existing.editorialIntro,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      status: existing.status,
      source: existing.source,
      slug: input.slug ?? existing.slug,
      seoTitle: input.seoTitle?.trim() ?? existing.seoTitle,
      seoDescription: input.seoDescription?.trim() ?? existing.seoDescription,
      showCategoryCarousel: input.showCategoryCarousel ?? existing.showCategoryCarousel,
      publishedAt: existing.publishedAt,
    });

    await this.comparisonRepository.update(updated);
    await this.revalidate(updated, existing);
  }

  private async revalidate(
    updated: ProductComparison,
    previous: ProductComparison,
  ): Promise<void> {
    const paths = new Set<string>([
      updated.canonicalPath(),
      previous.canonicalPath(),
      '/comparacoes',
      '/sitemap.xml',
    ]);
    await this.webRevalidator.revalidate({ paths: [...paths] });
  }
}

export class PublishComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, slug: string): Promise<void> {
    const existing = await this.comparisonRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('ProductComparison', id);
    }

    await assertUniqueComparisonSlug(this.comparisonRepository, slug, id);

    if (countEditorialWords(existing.editorialIntro) < MIN_EDITORIAL_WORDS) {
      throw new ValidationError(
        `Intro editorial deve ter pelo menos ${MIN_EDITORIAL_WORDS} palavras para publicação`,
      );
    }

    const products = await this.productRepository.findByIds(existing.productIds);
    if (products.length !== existing.productIds.length) {
      throw new ValidationError('Um ou mais produtos não foram encontrados');
    }

    assertSameComparisonCategory(products);

    const now = new Date();
    const published = ProductComparison.create({
      id: existing.id,
      shareToken: existing.shareToken,
      sessionId: existing.sessionId,
      productIds: existing.productIds,
      editorialIntro: existing.editorialIntro,
      createdAt: existing.createdAt,
      updatedAt: now,
      status: ComparisonStatus.PUBLISHED,
      source: existing.source,
      slug,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
      showCategoryCarousel: existing.showCategoryCarousel,
      publishedAt: existing.publishedAt ?? now,
    });

    await this.comparisonRepository.update(published);
    await this.webRevalidator.revalidate({
      paths: [
        published.canonicalPath(),
        `/comparar/${existing.shareToken}`,
        '/comparacoes',
        '/sitemap.xml',
      ],
    });
  }
}

export class DeleteComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.comparisonRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('ProductComparison', id);
    }

    await this.comparisonRepository.delete(id);
    await this.webRevalidator.revalidate({
      paths: [existing.canonicalPath(), '/comparacoes', '/sitemap.xml'],
    });
  }
}
