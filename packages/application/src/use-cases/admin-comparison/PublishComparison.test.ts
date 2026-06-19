import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  ComparisonStatus,
  ConflictError,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ProductComparison,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { PublishComparison } from '../admin-comparison/UpdateComparison.js';
import {
  createMockComparisonRepository,
  createMockProductRepository,
} from '../../test/mock-factories.js';

const PRODUCT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PRODUCT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CATEGORY_A_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function makeProduct(id: string): Product {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: `ext-${id}`,
    slug: `produto-${id}`,
    titleClean: `Produto ${id}`,
    titleRaw: `Produto ${id}`,
    price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
    affiliateLink: AffiliateLink.create('https://www.amazon.com.br/dp/test?tag=vitrine-20', 'amazon_br'),
    images: [],
    specsNormalized: [],
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
    categoryId: CATEGORY_A_ID,
  });
}

const longIntro = `${'palavra '.repeat(160)}fim`;

describe('PublishComparison', () => {
  it('rejects publish when intro has fewer than 150 words', async () => {
    const comparison = ProductComparison.create({
      id: 'cmp-1',
      shareToken: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: 'session-1',
      productIds: [PRODUCT_A_ID, PRODUCT_B_ID],
      editorialIntro: 'intro curta',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const comparisonRepository = createMockComparisonRepository({
      findById: vi.fn().mockResolvedValue(comparison),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([makeProduct(PRODUCT_A_ID), makeProduct(PRODUCT_B_ID)]),
    });
    const webRevalidator = { revalidate: vi.fn() };

    const useCase = new PublishComparison(
      comparisonRepository,
      productRepository,
      webRevalidator,
    );

    await expect(useCase.execute('cmp-1', 'slug-teste')).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects duplicate slug', async () => {
    const comparison = ProductComparison.create({
      id: 'cmp-1',
      shareToken: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: 'session-1',
      productIds: [PRODUCT_A_ID, PRODUCT_B_ID],
      editorialIntro: longIntro,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const comparisonRepository = createMockComparisonRepository({
      findById: vi.fn().mockResolvedValue(comparison),
      slugExists: vi.fn().mockResolvedValue(true),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([makeProduct(PRODUCT_A_ID), makeProduct(PRODUCT_B_ID)]),
    });
    const webRevalidator = { revalidate: vi.fn() };

    const useCase = new PublishComparison(
      comparisonRepository,
      productRepository,
      webRevalidator,
    );

    await expect(useCase.execute('cmp-1', 'slug-existente')).rejects.toBeInstanceOf(ConflictError);
  });

  it('publishes comparison with slug', async () => {
    const comparison = ProductComparison.create({
      id: 'cmp-1',
      shareToken: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: 'session-1',
      productIds: [PRODUCT_A_ID, PRODUCT_B_ID],
      editorialIntro: longIntro,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const comparisonRepository = createMockComparisonRepository({
      findById: vi.fn().mockResolvedValue(comparison),
      slugExists: vi.fn().mockResolvedValue(false),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([makeProduct(PRODUCT_A_ID), makeProduct(PRODUCT_B_ID)]),
    });
    const webRevalidator = { revalidate: vi.fn() };

    const useCase = new PublishComparison(
      comparisonRepository,
      productRepository,
      webRevalidator,
    );

    await useCase.execute('cmp-1', 'produto-a-vs-produto-b');

    expect(comparisonRepository.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(comparisonRepository.update).mock.calls[0]?.[0] as ProductComparison;
    expect(updated.status).toBe(ComparisonStatus.PUBLISHED);
    expect(updated.slug).toBe('produto-a-vs-produto-b');
  });
});
