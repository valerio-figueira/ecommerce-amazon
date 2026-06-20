import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  Category,
  ComparisonStatus,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ProductComparison,
} from '@ecommerce-amazon/domain';

import { GetComparisonByIdentifier } from './GetComparisonByIdentifier.js';
import {
  createMockCategoryRepository,
  createMockComparisonRepository,
  createMockProductRepository,
} from '../../test/mock-factories.js';

const PRODUCT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PRODUCT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CATEGORY_A_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PARENT_CATEGORY_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const SHARE_TOKEN = '550e8400-e29b-41d4-a716-446655440000';

function makeProduct(id: string, categoryId?: string): Product {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: `ext-${id}`,
    slug: `produto-${id}`,
    titleClean: `Produto ${id}`,
    titleRaw: `Produto ${id}`,
    price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
    affiliateLink: AffiliateLink.create(
      'https://www.amazon.com.br/dp/test?tag=vitrine-20',
      'amazon_br',
    ),
    images: [],
    specsNormalized: [],
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
    ...(categoryId !== undefined ? { categoryId } : {}),
  });
}

function makeComparison(overrides: Partial<Parameters<typeof ProductComparison.create>[0]> = {}) {
  return ProductComparison.create({
    id: 'cmp-1',
    shareToken: SHARE_TOKEN,
    sessionId: 'session-1',
    productIds: [PRODUCT_A_ID, PRODUCT_B_ID],
    editorialIntro: 'intro',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ComparisonStatus.PUBLISHED,
    slug: 'produto-a-vs-produto-b',
    showCategoryCarousel: true,
    ...overrides,
  });
}

describe('GetComparisonByIdentifier', () => {
  it('loads by share token without querying slug', async () => {
    const comparison = makeComparison();
    const comparisonRepository = createMockComparisonRepository({
      findByShareToken: vi.fn().mockResolvedValue(comparison),
      findBySlug: vi.fn(),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi
        .fn()
        .mockResolvedValue([
          makeProduct(PRODUCT_A_ID, CATEGORY_A_ID),
          makeProduct(PRODUCT_B_ID, CATEGORY_A_ID),
        ]),
      findSimilarPublishedByCategory: vi.fn().mockResolvedValue([]),
    });
    const categoryRepository = createMockCategoryRepository({
      findById: vi.fn().mockResolvedValue(
        Category.create({
          id: CATEGORY_A_ID,
          slug: 'cadeiras',
          label: 'Cadeiras',
          sortOrder: 0,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    });

    const useCase = new GetComparisonByIdentifier(
      comparisonRepository,
      productRepository,
      categoryRepository,
    );
    const result = await useCase.execute(SHARE_TOKEN);

    expect(result).not.toBeNull();
    expect(comparisonRepository.findByShareToken).toHaveBeenCalledWith(SHARE_TOKEN);
    expect(comparisonRepository.findBySlug).not.toHaveBeenCalled();
  });

  it('loads by slug without querying token', async () => {
    const comparison = makeComparison();
    const comparisonRepository = createMockComparisonRepository({
      findBySlug: vi.fn().mockResolvedValue(comparison),
      findByShareToken: vi.fn(),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi
        .fn()
        .mockResolvedValue([
          makeProduct(PRODUCT_A_ID, CATEGORY_A_ID),
          makeProduct(PRODUCT_B_ID, CATEGORY_A_ID),
        ]),
      findSimilarPublishedByCategory: vi.fn().mockResolvedValue([]),
    });
    const categoryRepository = createMockCategoryRepository({
      findById: vi.fn().mockResolvedValue(
        Category.create({
          id: CATEGORY_A_ID,
          slug: 'cadeiras',
          label: 'Cadeiras',
          sortOrder: 0,
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    });

    const useCase = new GetComparisonByIdentifier(
      comparisonRepository,
      productRepository,
      categoryRepository,
    );
    await useCase.execute('produto-a-vs-produto-b');

    expect(comparisonRepository.findBySlug).toHaveBeenCalledWith('produto-a-vs-produto-b');
    expect(comparisonRepository.findByShareToken).not.toHaveBeenCalled();
  });

  it('omits carousel when fewer than 3 related products remain', async () => {
    const comparison = makeComparison();
    const related = makeProduct('dddddddd-dddd-4ddd-8ddd-dddddddddddd', CATEGORY_A_ID);
    const comparisonRepository = createMockComparisonRepository({
      findBySlug: vi.fn().mockResolvedValue(comparison),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi
        .fn()
        .mockResolvedValue([
          makeProduct(PRODUCT_A_ID, CATEGORY_A_ID),
          makeProduct(PRODUCT_B_ID, CATEGORY_A_ID),
        ]),
      findSimilarPublishedByCategory: vi
        .fn()
        .mockResolvedValueOnce([related])
        .mockResolvedValueOnce([]),
    });
    const categoryRepository = createMockCategoryRepository({
      findById: vi.fn().mockResolvedValue(
        Category.create({
          id: CATEGORY_A_ID,
          slug: 'cadeiras',
          label: 'Cadeiras',
          sortOrder: 0,
          visible: true,
          parentId: PARENT_CATEGORY_ID,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    });

    const useCase = new GetComparisonByIdentifier(
      comparisonRepository,
      productRepository,
      categoryRepository,
    );
    const result = await useCase.execute('produto-a-vs-produto-b');

    expect(result?.relatedProducts).toEqual([]);
  });
});
