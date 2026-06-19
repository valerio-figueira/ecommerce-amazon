import { randomUUID } from 'node:crypto';

import {
  ProductComparison,
  ValidationError,
  type ProductComparisonRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

function normalizeProductIds(productIds: string[]): string[] {
  return [...productIds].sort();
}

function assertSameCategory(
  products: Array<{ id: string; categoryId?: string | undefined }>,
): void {
  if (products.length === 0) {
    throw new ValidationError('Produtos não encontrados para comparação');
  }

  const categoryKeys = products.map((product) => product.categoryId ?? '__none__');
  const unique = new Set(categoryKeys);
  if (unique.size > 1) {
    throw new ValidationError(
      'Só é possível comparar produtos da mesma categoria',
    );
  }
}

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
    const sortedIds = normalizeProductIds(input.productIds);
    const products = await this.productRepository.findByIds(sortedIds);

    if (products.length !== sortedIds.length) {
      throw new ValidationError('Um ou mais produtos não foram encontrados');
    }

    assertSameCategory(products);

    const existing = await this.comparisonRepository.findByProductIdSet(sortedIds);
    if (existing) {
      return { shareToken: existing.shareToken, id: existing.id, created: false as const };
    }

    const entity = ProductComparison.create({
      id: randomUUID(),
      shareToken: input.shareToken,
      sessionId: input.sessionId,
      productIds: sortedIds,
      editorialIntro: input.editorialIntro,
      createdAt: new Date(),
    });
    await this.comparisonRepository.save(entity);
    return { shareToken: entity.shareToken, id: entity.id, created: true as const };
  }
}
