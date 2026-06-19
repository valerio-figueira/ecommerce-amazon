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
    const productById = new Map(products.map((product) => [String(product.id), product]));
    const orderedProducts = comparison.productIds
      .map((id) => productById.get(id))
      .filter((product): product is NonNullable<typeof product> => product !== undefined);
    return { comparison, products: orderedProducts };
  }
}
