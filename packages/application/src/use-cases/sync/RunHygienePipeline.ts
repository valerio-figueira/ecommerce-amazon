import { TitleHygieneService, type CacheInvalidator, type ProductRepository } from '@ecommerce-amazon/domain';

export class RunHygienePipeline {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cacheInvalidator: CacheInvalidator,
    private readonly hygiene = new TitleHygieneService(),
  ) {}

  async execute(limit = 500) {
    const products = await this.productRepository.findDueForCatalogSync({ limit });
    const productIds: string[] = [];

    for (const product of products) {
      product.titleClean = this.hygiene.clean(product.titleRaw);
      await this.productRepository.save(product);
      productIds.push(product.id);
    }

    if (productIds.length > 0) {
      await this.cacheInvalidator.invalidateProducts(productIds);
    }

    return { processed: productIds.length };
  }
}
