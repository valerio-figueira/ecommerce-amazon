import type { PriceSnapshotRepository } from '@ecommerce-amazon/domain';
import type { CacheStore } from '@ecommerce-amazon/domain';

import { isPriceHistoryResult, type PriceHistoryResult } from './price-history.types.js';

export class GetProductPriceHistory {
  constructor(
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(productId: string, days = 90): Promise<PriceHistoryResult> {
    const version = await this.cache.getVersion('product', productId);
    const cacheKey = `vitrine:product:id:${productId}:history:v${version}`;
    const cached = await this.cache.get(cacheKey);
    if (isPriceHistoryResult(cached)) {
      return cached;
    }

    const snapshots = await this.snapshotRepository.findByProductId(productId, days);
    const response: PriceHistoryResult = { snapshots, days };
    await this.cache.set(cacheKey, response, 3600);
    return response;
  }
}
