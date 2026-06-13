import { vi } from 'vitest';

import type {
  CacheInvalidator,
  EventBus,
  MarketplaceFetcherFactory,
  PriceSnapshotRepository,
  ProductRepository,
} from '@ecommerce-amazon/domain';

export function createMockProductRepository(
  overrides: Partial<ProductRepository> = {},
): ProductRepository {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findByExternalId: vi.fn(),
    findPublished: vi.fn(),
    findByIds: vi.fn(),
    findDueForPriceRefresh: vi.fn(),
    findDueForCatalogSync: vi.fn(),
    save: vi.fn(),
    saveBatch: vi.fn(),
    ...overrides,
  };
}

export function createMockPriceSnapshotRepository(
  overrides: Partial<PriceSnapshotRepository> = {},
): PriceSnapshotRepository {
  return {
    insertBatch: vi.fn(),
    findByProductId: vi.fn(),
    ...overrides,
  };
}

export function createMockMarketplaceFetcherFactory(
  overrides: Partial<MarketplaceFetcherFactory> = {},
): MarketplaceFetcherFactory {
  return {
    get: vi.fn(),
    ...overrides,
  };
}

export function createMockEventBus(overrides: Partial<EventBus> = {}): EventBus {
  return {
    publish: vi.fn(),
    ...overrides,
  };
}

export function createMockCacheInvalidator(
  overrides: Partial<CacheInvalidator> = {},
): CacheInvalidator {
  return {
    invalidateProducts: vi.fn(),
    ...overrides,
  };
}
