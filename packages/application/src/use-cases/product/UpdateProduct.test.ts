import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  EntityNotFoundError,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { UpdateProduct } from './UpdateProduct.js';
import {
  createMockCacheInvalidator,
  createMockCategoryRepository,
  createMockPriceSnapshotRepository,
  createMockProductRepository,
  createMockPublicWebRevalidator,
} from '../../test/mock-factories.js';

const baseInput = {
  affiliateLink: 'https://www.amazon.com.br/dp/B08411SMN5?tag=vitrine-20',
  marketplace: 'amazon_br' as const,
  externalId: 'B08411SMN5',
  titleClean: 'Cadeira Ergonômica Atualizada',
  images: ['https://example.com/image.jpg'],
  editorialScore: 9,
  pros: ['Confortável'],
  cons: [],
  price: 799.9,
  shouldShowPrice: true,
  visible: true,
  availability: 'in_stock' as const,
};

function createExistingProduct(): Product {
  return Product.create({
    id: '11111111-1111-4111-8111-111111111111',
    marketplace: Marketplace.AMAZON_BR,
    externalId: 'B08411SMN5',
    slug: 'cadeira-ergonomica-pro-x',
    titleClean: 'Cadeira Ergonômica Pro X',
    titleRaw: 'Cadeira Ergonômica Pro X',
    price: Price.create({
      amount: 899.9,
      currency: 'BRL',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      isStale: false,
    }),
    affiliateLink: AffiliateLink.create(
      'https://www.amazon.com.br/dp/B08411SMN5',
      'amazon_br',
    ),
    images: [],
    specsNormalized: {},
    editorialScore: 85,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

describe('UpdateProduct', () => {
  it('updates editorial fields and price', async () => {
    const existing = createExistingProduct();
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(existing),
      findByExternalId: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockResolvedValue(undefined),
    });
    const snapshotRepository = createMockPriceSnapshotRepository({
      insertBatch: vi.fn().mockResolvedValue(undefined),
    });
    const cacheInvalidator = createMockCacheInvalidator();

    const useCase = new UpdateProduct(
      productRepository,
      createMockCategoryRepository(),
      snapshotRepository,
      cacheInvalidator,
      createMockPublicWebRevalidator(),
    );
    const result = await useCase.execute('cadeira-ergonomica-pro-x', baseInput);

    expect(result.slug).toBe('cadeira-ergonomica-pro-x');
    expect(existing.titleClean).toBe('Cadeira Ergonômica Atualizada');
    expect(existing.editorialScore).toBe(90);
    expect(existing.price.amount).toBe(799.9);
    expect(snapshotRepository.insertBatch).toHaveBeenCalledOnce();
    expect(productRepository.save).toHaveBeenCalledOnce();
  });

  it('updates specsNormalized from admin payload', async () => {
    const existing = createExistingProduct();
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(existing),
      findByExternalId: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new UpdateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
      createMockPublicWebRevalidator(),
    );

    await useCase.execute('cadeira-ergonomica-pro-x', {
      ...baseInput,
      specsNormalized: {
        Switches: 'Red',
        Layout: 'ABNT2',
      },
    });

    expect(existing.specsNormalized).toEqual({
      Switches: 'Red',
      Layout: 'ABNT2',
    });
  });

  it('marks price stale when shouldShowPrice is false', async () => {
    const existing = createExistingProduct();
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(existing),
      findByExternalId: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new UpdateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
      createMockPublicWebRevalidator(),
    );

    await useCase.execute('cadeira-ergonomica-pro-x', {
      ...baseInput,
      shouldShowPrice: false,
    });

    expect(existing.shouldShowPrice).toBe(false);
  });

  it('updates visible flag for home vitrine', async () => {
    const existing = createExistingProduct();
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(existing),
      findByExternalId: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new UpdateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
      createMockPublicWebRevalidator(),
    );

    await useCase.execute('cadeira-ergonomica-pro-x', {
      ...baseInput,
      visible: false,
    });

    expect(existing.visible).toBe(false);
  });

  it('throws EntityNotFoundError when slug is missing', async () => {
    const useCase = new UpdateProduct(
      createMockProductRepository({ findBySlug: vi.fn().mockResolvedValue(null) }),
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
      createMockPublicWebRevalidator(),
    );

    await expect(useCase.execute('missing-slug', baseInput)).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });

  it('throws ValidationError when external ID changes', async () => {
    const existing = createExistingProduct();
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(existing),
    });

    const useCase = new UpdateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
      createMockPublicWebRevalidator(),
    );

    await expect(
      useCase.execute('cadeira-ergonomica-pro-x', {
        ...baseInput,
        externalId: 'B099999999',
        affiliateLink: 'https://www.amazon.com.br/dp/B099999999',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
