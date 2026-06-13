import type { ProductComparisonRepository, ProductRepository } from '@ecommerce-amazon/domain';

export class GetComparisonByToken {
  constructor(
    private readonly comparisonRepository: ProductComparisonRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(shareToken: string) {
    const comparison = await this.comparisonRepository.findByShareToken(shareToken);
    if (!comparison) return null;
    const products = await this.productRepository.findByIds(comparison.productIds);
    return { comparison, products };
  }
}
