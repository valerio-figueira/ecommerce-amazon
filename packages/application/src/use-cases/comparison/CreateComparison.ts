import { randomUUID } from 'node:crypto';

import { ProductComparison, type ProductComparisonRepository } from '@ecommerce-amazon/domain';

export class CreateComparison {
  constructor(private readonly comparisonRepository: ProductComparisonRepository) {}

  async execute(input: {
    sessionId: string;
    productIds: string[];
    editorialIntro: string;
    shareToken: string;
  }) {
    const entity = ProductComparison.create({
      id: randomUUID(),
      shareToken: input.shareToken,
      sessionId: input.sessionId,
      productIds: input.productIds,
      editorialIntro: input.editorialIntro,
      createdAt: new Date(),
    });
    await this.comparisonRepository.save(entity);
    return { shareToken: entity.shareToken, id: entity.id };
  }
}
