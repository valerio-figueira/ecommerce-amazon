import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ProductComparison,
  ValidationError,
  type ProductComparisonRepository,
} from '@ecommerce-amazon/domain';

import { CreateComparison } from './CreateComparison.js';
import { createMockProductRepository } from '../../test/mock-factories.js';

const PRODUCT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PRODUCT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CATEGORY_A_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const CATEGORY_B_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

function makeProduct(id: string, categoryId?: string): Product {
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
    specsNormalized: {},
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
    ...(categoryId !== undefined ? { categoryId } : {}),
  });
}

function createMockComparisonRepository(
  overrides: Partial<ProductComparisonRepository> = {},
): ProductComparisonRepository {
  return {
    findByShareToken: vi.fn(),
    findByProductIdSet: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('CreateComparison', () => {
  const intro =
    'Texto editorial com mais de cento e cinquenta caracteres para validar o comparador lado a lado entre produtos da mesma categoria com curadoria transparente e links afiliados.';

  it('creates a new comparison with sorted product ids', async () => {
    const productA = makeProduct(PRODUCT_A_ID, CATEGORY_A_ID);
    const productB = makeProduct(PRODUCT_B_ID, CATEGORY_A_ID);
    const comparisonRepository = createMockComparisonRepository();
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([productA, productB]),
    });

    const useCase = new CreateComparison(comparisonRepository, productRepository);
    const result = await useCase.execute({
      sessionId: 'session-1',
      productIds: [productB.id, productA.id],
      editorialIntro: intro,
      shareToken: 'token-1',
    });

    expect(result.created).toBe(true);
    expect(comparisonRepository.save).toHaveBeenCalledOnce();
    const saved = vi.mocked(comparisonRepository.save).mock.calls[0]?.[0] as ProductComparison;
    expect(saved.productIds).toEqual([productA.id, productB.id]);
  });

  it('returns existing comparison for same product set in different order', async () => {
    const productA = makeProduct(PRODUCT_A_ID, CATEGORY_A_ID);
    const productB = makeProduct(PRODUCT_B_ID, CATEGORY_A_ID);
    const existing = ProductComparison.create({
      id: 'cmp-1',
      shareToken: 'existing-token',
      sessionId: 'old-session',
      productIds: [productA.id, productB.id],
      editorialIntro: intro,
      createdAt: new Date(),
    });
    const comparisonRepository = createMockComparisonRepository({
      findByProductIdSet: vi.fn().mockResolvedValue(existing),
    });
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([productA, productB]),
    });

    const useCase = new CreateComparison(comparisonRepository, productRepository);
    const result = await useCase.execute({
      sessionId: 'session-2',
      productIds: [productB.id, productA.id],
      editorialIntro: intro,
      shareToken: 'new-token',
    });

    expect(result.created).toBe(false);
    expect(result.shareToken).toBe('existing-token');
    expect(comparisonRepository.save).not.toHaveBeenCalled();
  });

  it('rejects products from different categories', async () => {
    const productA = makeProduct(PRODUCT_A_ID, CATEGORY_A_ID);
    const productB = makeProduct(PRODUCT_B_ID, CATEGORY_B_ID);
    const comparisonRepository = createMockComparisonRepository();
    const productRepository = createMockProductRepository({
      findByIds: vi.fn().mockResolvedValue([productA, productB]),
    });

    const useCase = new CreateComparison(comparisonRepository, productRepository);

    await expect(
      useCase.execute({
        sessionId: 'session-1',
        productIds: [productA.id, productB.id],
        editorialIntro: intro,
        shareToken: 'token-1',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
