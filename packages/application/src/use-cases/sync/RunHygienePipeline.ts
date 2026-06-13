import { TitleHygieneService, type ProductRepository } from '@ecommerce-amazon/domain';

export class RunHygienePipeline {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly hygiene = new TitleHygieneService(),
  ) {}

  async execute(limit = 500) {
    const products = await this.productRepository.findDueForCatalogSync({ limit });
    for (const product of products) {
      product.titleClean = this.hygiene.clean(product.titleRaw);
      await this.productRepository.save(product);
    }
    return { processed: products.length };
  }
}
