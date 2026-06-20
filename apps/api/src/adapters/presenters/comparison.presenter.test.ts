import { describe, expect, it } from 'vitest';

import {
  AffiliateLink,
  ComparisonStatus,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ProductComparison,
} from '@ecommerce-amazon/domain';
import { comparisonPublicDetailSchema } from '@ecommerce-amazon/shared/comparison';

import { toComparisonPublicDto } from './comparison.presenter.js';

const PRODUCT_A_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const PRODUCT_B_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SHARE_TOKEN = '550e8400-e29b-41d4-a716-446655440000';

function makeProduct(id: string): Product {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: `ext-${id}`,
    slug: `produto-${id.slice(0, 8)}`,
    titleClean: `Produto ${id}`,
    titleRaw: `Produto ${id}`,
    price: Price.create({
      amount: 100,
      currency: 'BRL',
      updatedAt: new Date('2025-06-01T12:00:00.000Z'),
    }),
    affiliateLink: AffiliateLink.create(
      'https://www.amazon.com.br/dp/test?tag=vitrine-20',
      'amazon_br',
    ),
    images: ['https://cdn.example.com/image.jpg'],
    specsNormalized: [
      {
        group_id: 'detalhes_produto',
        group_title: 'Detalhes do Produto',
        is_collapsed_default: false,
        properties: [{ key: 'Peso', value: '1 kg' }],
      },
    ],
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date('2025-06-01T10:00:00.000Z'),
  });
}

function makeComparison(overrides: Partial<Parameters<typeof ProductComparison.create>[0]> = {}) {
  return ProductComparison.create({
    id: 'cmp-1',
    shareToken: SHARE_TOKEN,
    sessionId: 'session-1',
    productIds: [PRODUCT_A_ID, PRODUCT_B_ID],
    editorialIntro: 'Intro editorial',
    createdAt: new Date('2025-06-01T10:00:00.000Z'),
    updatedAt: new Date('2025-06-02T08:00:00.000Z'),
    status: ComparisonStatus.PUBLISHED,
    slug: 'produto-a-vs-produto-b',
    showCategoryCarousel: true,
    publishedAt: new Date('2025-06-02T08:00:00.000Z'),
    ...overrides,
  });
}

describe('toComparisonPublicDto', () => {
  it('matches comparisonPublicDetailSchema expected by apps/web', () => {
    const dto = toComparisonPublicDto({
      comparison: makeComparison(),
      products: [makeProduct(PRODUCT_A_ID), makeProduct(PRODUCT_B_ID)],
      relatedProducts: [],
      categorySlug: 'perifericos',
      categoryLabel: 'Periféricos',
    });

    const parsed = comparisonPublicDetailSchema.parse(dto);

    expect(parsed.status).toBe('published');
    expect(parsed.showCategoryCarousel).toBe(true);
    expect(parsed.canonicalPath).toBe('/comparar/produto-a-vs-produto-b');
    expect(parsed.updatedAt).toBe('2025-06-02T08:00:00.000Z');
    expect(parsed.products).toHaveLength(2);
    expect(parsed.categorySlug).toBe('perifericos');
  });

  it('uses share token canonical path for draft comparisons', () => {
    const dto = toComparisonPublicDto({
      comparison: makeComparison({ status: ComparisonStatus.DRAFT, slug: undefined }),
      products: [makeProduct(PRODUCT_A_ID), makeProduct(PRODUCT_B_ID)],
      relatedProducts: [],
    });

    const parsed = comparisonPublicDetailSchema.parse(dto);

    expect(parsed.status).toBe('draft');
    expect(parsed.canonicalPath).toBe(`/comparar/${SHARE_TOKEN}`);
  });
});
