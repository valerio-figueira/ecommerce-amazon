import { randomUUID } from 'node:crypto';

import {
  PriceSnapshot,
  SnapshotSource,
  type CacheInvalidator,
  type EventBus,
  type Marketplace,
  type MarketplaceFetcherFactory,
  type PriceSnapshotRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export class UpdatePricesBatch {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly fetcherFactory: MarketplaceFetcherFactory,
    private readonly eventBus: EventBus,
    private readonly cacheInvalidator: CacheInvalidator,
  ) {}

  async execute(input: { marketplace: Marketplace; externalIds: string[] }) {
    const fetcher = this.fetcherFactory.get(input.marketplace);
    const results = await fetcher.fetchProductsBatch(input.externalIds);
    const productIds: string[] = [];
    const snapshots: PriceSnapshot[] = [];
    const now = new Date();

    for (const result of results) {
      const product = await this.productRepository.findByExternalId(
        input.marketplace,
        result.externalId,
      );
      if (!product) continue;

      product.updatePrice(result.price);
      productIds.push(product.id);
      snapshots.push(
        PriceSnapshot.create({
          id: randomUUID(),
          productId: product.id,
          amount: result.price.amount,
          currency: result.price.currency,
          source: SnapshotSource.WORKER_CRON,
          capturedAt: now,
        }),
      );

      for (const event of product.pullDomainEvents()) {
        await this.eventBus.publish(event);
      }

      await this.productRepository.save(product);
    }

    if (snapshots.length > 0) {
      await this.snapshotRepository.insertBatch(snapshots);
    }

    if (productIds.length > 0) {
      await this.cacheInvalidator.invalidateProducts(productIds);
    }

    return { processed: productIds.length };
  }
}
