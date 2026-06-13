import {
  TitleHygieneService,
  type Marketplace,
  type MarketplaceFetcherFactory,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export class SyncCatalogBatch {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fetcherFactory: MarketplaceFetcherFactory,
    private readonly hygiene = new TitleHygieneService(),
  ) {}

  async execute(input: { marketplace: Marketplace; externalIds: string[] }) {
    const fetcher = this.fetcherFactory.get(input.marketplace);
    const results = await fetcher.fetchProductsBatch(input.externalIds);
    let processed = 0;

    for (const result of results) {
      const product = await this.productRepository.findByExternalId(
        input.marketplace,
        result.externalId,
      );
      if (!product) continue;

      product.titleRaw = result.rawTitle;
      product.titleClean = this.hygiene.clean(result.rawTitle);
      product.images = result.imageUrls;
      product.availability = result.availability;
      product.rating = result.rating;
      product.reviewCount = result.reviewCount;
      await this.productRepository.save(product);
      processed++;
    }

    return { processed };
  }
}
