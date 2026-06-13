import { describe, expect, it, vi } from 'vitest';

import { Marketplace, Price, ProductAvailability } from '@ecommerce-amazon/domain';

import {
  createMockCacheInvalidator,
  createMockEventBus,
  createMockMarketplaceFetcherFactory,
  createMockPriceSnapshotRepository,
  createMockProductRepository,
} from './test/mock-factories.js';
import { UpdatePricesBatch } from './use-cases/sync/UpdatePricesBatch.js';

describe('UpdatePricesBatch', () => {
  it('publishes PriceDropped without calling email sender', async () => {
    const product = {
      id: '11111111-1111-4111-8111-111111111111',
      externalId: 'B001',
      updatePrice: vi.fn(),
      pullDomainEvents: vi.fn().mockReturnValue([
        {
          type: 'PriceDropped',
          productId: '11111111-1111-4111-8111-111111111111',
        },
      ]),
    };

    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(product),
    });

    const snapshotRepository = createMockPriceSnapshotRepository();
    const fetcherFactory = createMockMarketplaceFetcherFactory({
      get: vi.fn().mockReturnValue({
        fetchProductsBatch: vi.fn().mockResolvedValue([
          {
            externalId: 'B001',
            rawTitle: 'Product',
            price: Price.create({ amount: 80, currency: 'BRL', updatedAt: new Date() }),
            availability: ProductAvailability.IN_STOCK,
            imageUrls: [],
          },
        ]),
      }),
    });

    const eventBus = createMockEventBus();
    const cacheInvalidator = createMockCacheInvalidator();

    const useCase = new UpdatePricesBatch(
      productRepository,
      snapshotRepository,
      fetcherFactory,
      eventBus,
      cacheInvalidator,
    );

    await useCase.execute({ marketplace: Marketplace.AMAZON_BR, externalIds: ['B001'] });

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PriceDropped' }),
    );
    expect(cacheInvalidator.invalidateProducts).toHaveBeenCalled();
  });
});
