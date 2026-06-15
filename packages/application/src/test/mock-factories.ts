import { vi } from 'vitest';

import type {
  CacheInvalidator,
  CategoryRepository,
  EventBus,
  MarketplaceFetcherFactory,
  PageCacheInvalidator,
  PageRepository,
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
    findSimilarPublishedByCategory: vi.fn(),
    findByIds: vi.fn(),
    findDueForPriceRefresh: vi.fn(),
    findDueForCatalogSync: vi.fn(),
    save: vi.fn(),
    saveBatch: vi.fn(),
    ...overrides,
  };
}

export function createMockCategoryRepository(
  overrides: Partial<CategoryRepository> = {},
): CategoryRepository {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    listAll: vi.fn(),
    listChildren: vi.fn(),
    getDescendantIds: vi.fn(),
    getAncestorChain: vi.fn(),
    countProductsInIds: vi.fn(),
    countProductsByCategoryId: vi.fn(),
    hasChildren: vi.fn(),
    countDirectProducts: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    slugExists: vi.fn(),
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

export function createMockPageCacheInvalidator(
  overrides: Partial<PageCacheInvalidator> = {},
): PageCacheInvalidator {
  return {
    invalidateBySlug: vi.fn(),
    ...overrides,
  };
}

export function createMockPageRepository(
  overrides: Partial<PageRepository> = {},
): PageRepository {
  return {
    findPublishedBySlug: vi.fn(),
    findPageBySlug: vi.fn(),
    findPageById: vi.fn(),
    listPages: vi.fn(),
    findBlockById: vi.fn(),
    updateBlocksOrder: vi.fn(),
    saveBlock: vi.fn(),
    insertBlockAtPosition: vi.fn(),
    deleteBlock: vi.fn(),
    ...overrides,
  };
}
