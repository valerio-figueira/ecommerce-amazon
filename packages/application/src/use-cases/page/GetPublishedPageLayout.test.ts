import { describe, expect, it, vi } from 'vitest';

import {
  BlockType,
  PageBlock,
  PageLayout,
  PageStatus,
  Product,
  ProductAvailability,
  AffiliateLink,
  Marketplace,
  Price,
} from '@ecommerce-amazon/domain';

import { createMockPageRepository, createMockProductRepository } from '../../test/mock-factories.js';
import { ListProducts } from '../product/ListProducts.js';
import { GetPublishedPageLayout } from './GetPublishedPageLayout.js';

const PAGE_ID = 'f1111111-1111-4111-8111-111111111111';
const BLOCK_DYNAMIC_ID = 'f7111111-1111-4111-8111-111111111111';

function createProduct(amount: number, stale: boolean) {
  return Product.create({
    id: 'a1111111-1111-4111-8111-111111111111',
    marketplace: Marketplace.AMAZON_BR,
    externalId: 'B001',
    slug: 'cadeira-ergonomica-home-office',
    titleClean: 'Cadeira Ergonômica',
    titleRaw: 'Cadeira Ergonômica Raw',
    price: Price.create({
      amount,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: stale,
    }),
    affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
    images: ['https://example.com/img.jpg'],
    specsNormalized: {},
    editorialScore: 90,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
  });
}

describe('GetPublishedPageLayout', () => {
  it('hydrates DYNAMIC_PRODUCT_GRID with renderedData', async () => {
    const freshProduct = createProduct(899.9, false);
    const pageRepository = createMockPageRepository({
      findPublishedBySlug: vi.fn().mockResolvedValue({
        layout: PageLayout.create({
          id: PAGE_ID,
          slug: 'home',
          title: 'Home',
          status: PageStatus.PUBLISHED,
          updatedAt: new Date(),
        }),
        blocks: [
          PageBlock.create({
            id: BLOCK_DYNAMIC_ID,
            pageId: PAGE_ID,
            type: BlockType.DYNAMIC_PRODUCT_GRID,
            sortOrder: 0,
            props: {
              title: 'Ofertas home office',
              categoryVertical: 'home-office',
              limit: 4,
            },
          }),
        ],
      }),
    });

    const productRepository = createMockProductRepository({
      findPublished: vi.fn().mockResolvedValue({ items: [freshProduct], total: 1 }),
    });
    const listProducts = new ListProducts(productRepository);
    const cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetPublishedPageLayout(pageRepository, cache, listProducts);
    const layout = await useCase.execute('home');

    expect(layout).not.toBeNull();
    const dynamicBlock = layout?.blocks[0];
    expect(dynamicBlock?.type).toBe(BlockType.DYNAMIC_PRODUCT_GRID);
    expect(dynamicBlock?.renderedData).toHaveLength(1);
    expect(dynamicBlock?.renderedData?.[0]?.price.amount).toBe(899.9);
    expect(dynamicBlock?.renderedData?.[0]?.price.shouldShowPrice).toBe(true);
  });

  it('hydrates stale products with null amount on cache hit', async () => {
    const staleProduct = createProduct(899.9, true);
    staleProduct.markPriceStale();

    const cachedLayout = {
      slug: 'home',
      title: 'Home',
      blocks: [
        {
          id: BLOCK_DYNAMIC_ID,
          type: BlockType.DYNAMIC_PRODUCT_GRID,
          sortOrder: 0,
          visibility: 'all' as const,
          props: {
            title: 'Ofertas home office',
            limit: 4,
          },
        },
      ],
    };

    const pageRepository = createMockPageRepository();
    const productRepository = createMockProductRepository({
      findPublished: vi.fn().mockResolvedValue({ items: [staleProduct], total: 1 }),
    });
    const listProducts = new ListProducts(productRepository);
    const cache = {
      get: vi.fn().mockResolvedValue(cachedLayout),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetPublishedPageLayout(pageRepository, cache, listProducts);
    const layout = await useCase.execute('home');

    expect(pageRepository.findPublishedBySlug).not.toHaveBeenCalled();
    expect(layout?.blocks[0]?.renderedData?.[0]?.price.amount).toBeNull();
    expect(layout?.blocks[0]?.renderedData?.[0]?.price.shouldShowPrice).toBe(false);
  });
});
