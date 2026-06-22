import { describe, expect, it, vi } from 'vitest';

import {
  ArticleStatus,
  ArticleType,
  Marketplace,
  Product,
  ProductAvailability,
  AffiliateLink,
  Price,
} from '@ecommerce-amazon/domain';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';
import { weeklyTrendsPropsSchema } from '@ecommerce-amazon/shared/cms';

import { GetWeeklyTrends } from './GetWeeklyTrends.js';

function createMockGateService(pricesEnabled = true) {
  return {
    isPricesEnabled: vi.fn().mockResolvedValue(pricesEnabled),
  };
}

function createProduct(id: string, slug: string, visible = true): Product {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: 'B001',
    slug,
    titleClean: `Product ${slug}`,
    titleRaw: `Product ${slug} raw`,
    price: Price.create({
      amount: 100,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: false,
    }),
    affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
    images: ['https://example.com/img.jpg'],
    specsNormalized: [],
    editorialScore: 50,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    visible,
    createdAt: new Date(),
  });
}

function createPublishedArticle(id: string, slug: string) {
  return {
    id,
    slug,
    title: `Article ${slug}`,
    excerpt: 'Excerpt',
    coverImageUrl: 'https://example.com/cover.jpg',
    body: '<p>Body</p>',
    type: ArticleType.GUIDE,
    status: ArticleStatus.PUBLISHED,
    authorId: null,
    categoryId: null,
    clusterId: null,
    seoTitle: null,
    seoDescription: null,
    seo: {},
    embeds: [],
    publishedAt: new Date('2026-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('GetWeeklyTrends', () => {
  const defaultProps = weeklyTrendsPropsSchema.parse({});
  const PRODUCT_A_ID = 'a1111111-1111-4111-8111-111111111111';
  const PRODUCT_B_ID = 'a2222222-2222-4222-8222-222222222222';
  const ARTICLE_A_ID = 'b1111111-1111-4111-8111-111111111111';

  it('returns ranked products and articles for the last 7 days', async () => {
    const productA = createProduct(PRODUCT_A_ID, 'prod-a');
    const productB = createProduct(PRODUCT_B_ID, 'prod-b');

    const analyticsRepository = {
      getTopClickedProducts: vi.fn().mockResolvedValue([
        {
          productId: PRODUCT_A_ID,
          slug: 'prod-a',
          title: 'A',
          marketplace: 'amazon_br',
          clickCount: 10,
        },
        {
          productId: PRODUCT_B_ID,
          slug: 'prod-b',
          title: 'B',
          marketplace: 'amazon_br',
          clickCount: 5,
        },
      ]),
    };
    const engagementAnalyticsRepository = {
      getTopArticlesByEvent: vi
        .fn()
        .mockResolvedValue([{ articleId: ARTICLE_A_ID, slug: 'art-a', title: 'Art A', count: 8 }]),
    };
    const productRepository = {
      findByIds: vi.fn().mockResolvedValue([productB, productA]),
    };
    const contentRepository = {
      findArticleById: vi.fn().mockResolvedValue(createPublishedArticle(ARTICLE_A_ID, 'art-a')),
    };

    const useCase = new GetWeeklyTrends(
      analyticsRepository,
      engagementAnalyticsRepository,
      productRepository,
      contentRepository,
      createMockGateService(),
    );

    const result = await useCase.execute({ ...defaultProps, minItems: 1 });

    expect(result).not.toBeNull();
    expect(result?.products).toHaveLength(2);
    expect(result?.products[0]?.slug).toBe('prod-a');
    expect(result?.products[1]?.slug).toBe('prod-b');
    expect(result?.articles).toHaveLength(1);
    expect(result?.articles[0]?.slug).toBe('art-a');
    expect(result?.periodLabel).toBe('últimos 7 dias');

    expect(analyticsRepository.getTopClickedProducts).toHaveBeenCalled();
    expect(engagementAnalyticsRepository.getTopArticlesByEvent).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Date),
      EngagementEventType.ARTICLE_PAGE_VIEW,
      defaultProps.limit * 2,
    );
  });

  it('filters invisible products while preserving click ranking order', async () => {
    const visible = createProduct(PRODUCT_A_ID, 'visible-prod', true);
    const hidden = createProduct(PRODUCT_B_ID, 'hidden-prod', false);

    const useCase = new GetWeeklyTrends(
      {
        getTopClickedProducts: vi.fn().mockResolvedValue([
          {
            productId: PRODUCT_B_ID,
            slug: 'hidden-prod',
            title: 'Hidden',
            marketplace: 'amazon_br',
            clickCount: 20,
          },
          {
            productId: PRODUCT_A_ID,
            slug: 'visible-prod',
            title: 'Visible',
            marketplace: 'amazon_br',
            clickCount: 5,
          },
        ]),
      },
      { getTopArticlesByEvent: vi.fn().mockResolvedValue([]) },
      { findByIds: vi.fn().mockResolvedValue([hidden, visible]) },
      { findArticleById: vi.fn() },
      createMockGateService(),
    );

    const result = await useCase.execute({ ...defaultProps, minItems: 1 });

    expect(result?.products).toHaveLength(1);
    expect(result?.products[0]?.slug).toBe('visible-prod');
  });

  it('returns null on cold start when both tabs are below minItems', async () => {
    const useCase = new GetWeeklyTrends(
      { getTopClickedProducts: vi.fn().mockResolvedValue([]) },
      { getTopArticlesByEvent: vi.fn().mockResolvedValue([]) },
      { findByIds: vi.fn().mockResolvedValue([]) },
      { findArticleById: vi.fn() },
      createMockGateService(),
    );

    const result = await useCase.execute(defaultProps);
    expect(result).toBeNull();
  });

  it('excludes draft articles during enrichment', async () => {
    const useCase = new GetWeeklyTrends(
      { getTopClickedProducts: vi.fn().mockResolvedValue([]) },
      {
        getTopArticlesByEvent: vi
          .fn()
          .mockResolvedValue([
            { articleId: ARTICLE_A_ID, slug: 'draft-art', title: 'Draft', count: 4 },
          ]),
      },
      { findByIds: vi.fn().mockResolvedValue([]) },
      {
        findArticleById: vi.fn().mockResolvedValue({
          ...createPublishedArticle(ARTICLE_A_ID, 'draft-art'),
          status: ArticleStatus.DRAFT,
        }),
      },
      createMockGateService(),
    );

    const result = await useCase.execute({ ...defaultProps, minItems: 1 });
    expect(result).toBeNull();
  });
});
