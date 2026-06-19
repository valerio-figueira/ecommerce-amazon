import { randomUUID } from 'node:crypto';

import {
  ComparisonSource,
  ComparisonStatus,
  ProductComparison,
  ValidationError,
  type ProductComparisonRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

import {
  assertSameComparisonCategory,
  normalizeComparisonProductIds,
} from './comparison.helpers.js';

export class CreateComparison {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: {
    sessionId: string;
    productIds: string[];
    editorialIntro: string;
    shareToken: string;
  }) {
    const sortedIds = normalizeComparisonProductIds(input.productIds);
    const products = await this.productRepository.findByIds(sortedIds);

    if (products.length !== sortedIds.length) {
      throw new ValidationError('Um ou mais produtos não foram encontrados');
    }

    assertSameComparisonCategory(products);

    const existing = await this.comparisonRepository.findByProductIdSet(sortedIds);
    if (existing) {
      return { shareToken: existing.shareToken, id: existing.id, created: false as const };
    }

    const now = new Date();
    const entity = ProductComparison.create({
      id: randomUUID(),
      shareToken: input.shareToken,
      sessionId: input.sessionId,
      productIds: sortedIds,
      editorialIntro: input.editorialIntro,
      createdAt: now,
      updatedAt: now,
      status: ComparisonStatus.DRAFT,
      source: ComparisonSource.USER_GENERATED,
    });
    await this.comparisonRepository.save(entity);
    return { shareToken: entity.shareToken, id: entity.id, created: true as const };
  }
}
