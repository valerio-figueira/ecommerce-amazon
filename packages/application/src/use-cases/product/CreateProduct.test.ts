import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  ConflictError,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { CreateProduct } from './CreateProduct.js';
import {
  createMockCacheInvalidator,
  createMockCategoryRepository,
  createMockPriceSnapshotRepository,
  createMockProductRepository,
} from '../../test/mock-factories.js';

const baseInput = {
  affiliateLink: 'https://www.amazon.com.br/dp/B08411SMN5?tag=vitrine-20',
  marketplace: 'amazon_br' as const,
  externalId: 'B08411SMN5',
  titleClean: 'Cadeira Ergonômica Pro X',
  images: ['https://example.com/image.jpg'],
  editorialScore: 8.5,
  pros: ['Confortável'],
  cons: ['Preço alto'],
  price: 899.9,
  shouldShowPrice: true,
  visible: true,
  availability: 'in_stock' as const,
};

describe('CreateProduct', () => {
  it('creates product with fresh price when shouldShowPrice is true', async () => {
    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    });
    const snapshotRepository = createMockPriceSnapshotRepository({
      insertBatch: vi.fn().mockResolvedValue(undefined),
    });
    const cacheInvalidator = createMockCacheInvalidator();

    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      snapshotRepository,
      cacheInvalidator,
    );
    const result = await useCase.execute(baseInput);

    expect(result.slug).toBe('cadeira-ergonomica-pro-x');
    expect(productRepository.save).toHaveBeenCalledOnce();

    const savedProduct = vi.mocked(productRepository.save).mock.calls[0]?.[0] as Product;
    expect(savedProduct.shouldShowPrice).toBe(true);
    expect(savedProduct.visible).toBe(true);
    expect(savedProduct.editorialScore).toBe(85);
    expect(savedProduct.specsNormalized).toEqual({});
    expect(snapshotRepository.insertBatch).toHaveBeenCalledOnce();
    expect(cacheInvalidator.invalidateProducts).toHaveBeenCalledOnce();
  });

  it('marks price stale when shouldShowPrice is false', async () => {
    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    });
    const snapshotRepository = createMockPriceSnapshotRepository({
      insertBatch: vi.fn().mockResolvedValue(undefined),
    });
    const cacheInvalidator = createMockCacheInvalidator();

    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      snapshotRepository,
      cacheInvalidator,
    );
    await useCase.execute({ ...baseInput, shouldShowPrice: false, price: 500 });

    const savedProduct = vi.mocked(productRepository.save).mock.calls[0]?.[0] as Product;
    expect(savedProduct.shouldShowPrice).toBe(false);
  });

  it('throws ConflictError when external ID already exists', async () => {
    const existing = Product.create({
      id: '11111111-1111-4111-8111-111111111111',
      marketplace: Marketplace.AMAZON_BR,
      externalId: 'B08411SMN5',
      slug: 'existing',
      titleClean: 'Existing',
      titleRaw: 'Existing',
      price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
      affiliateLink: AffiliateLink.create(
        'https://www.amazon.com.br/dp/B08411SMN5',
        'amazon_br',
      ),
      images: [],
      specsNormalized: {},
      editorialScore: 50,
      availability: ProductAvailability.IN_STOCK,
      tags: [],
      createdAt: new Date(),
    });

    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(existing),
    });
    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
    );

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it('resolves slug collisions with numeric suffix', async () => {
    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(null),
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce({ slug: 'cadeira-ergonomica-pro-x' })
        .mockResolvedValueOnce(null),
      save: vi.fn().mockResolvedValue(undefined),
    });
    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
    );

    const result = await useCase.execute(baseInput);
    expect(result.slug).toBe('cadeira-ergonomica-pro-x-2');
  });

  it('persists specsNormalized when provided', async () => {
    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    });
    const snapshotRepository = createMockPriceSnapshotRepository({
      insertBatch: vi.fn().mockResolvedValue(undefined),
    });
    const cacheInvalidator = createMockCacheInvalidator();

    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      snapshotRepository,
      cacheInvalidator,
    );
    await useCase.execute({
      ...baseInput,
      specsNormalized: {
        Material: 'Mesh',
        'Peso Máximo Suportado': '120 kg',
      },
    });

    const savedProduct = vi.mocked(productRepository.save).mock.calls[0]?.[0] as Product;
    expect(savedProduct.specsNormalized).toEqual({
      Material: 'Mesh',
      'Peso Máximo Suportado': '120 kg',
    });
  });

  it('throws ValidationError when marketplace mismatches parsed URL', async () => {
    const productRepository = createMockProductRepository({
      findByExternalId: vi.fn().mockResolvedValue(null),
    });
    const useCase = new CreateProduct(
      productRepository,
      createMockCategoryRepository(),
      createMockPriceSnapshotRepository(),
      createMockCacheInvalidator(),
    );

    await expect(
      useCase.execute({
        ...baseInput,
        marketplace: 'shopee_br',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
