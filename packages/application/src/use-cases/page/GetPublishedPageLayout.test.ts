import { describe, expect, it, vi } from 'vitest';

import {
  BlockType,
  CuratedCollection,
  PageBlock,
  PageLayout,
  PageStatus,
  Product,
  ProductAvailability,
  AffiliateLink,
  Marketplace,
  Price,
  Category,
} from '@ecommerce-amazon/domain';

import { createMockPageRepository, createMockProductRepository } from '../../test/mock-factories.js';
import { ListProducts } from '../product/ListProducts.js';
import { GetPublishedPageLayout } from './GetPublishedPageLayout.js';

function createMockGetCuratedCollection() {
  return {
    execute: vi.fn().mockResolvedValue(null),
  };
}

function createLayoutDeps(
  productRepository: ReturnType<typeof createMockProductRepository>,
  overrides: {
    curatedCollectionRepository?: {
      findById: ReturnType<typeof vi.fn>;
    };
    contentRepository?: {
      findArticleById: ReturnType<typeof vi.fn>;
    };
    categoryRepository?: {
      findBySlug: ReturnType<typeof vi.fn>;
      getDescendantIds: ReturnType<typeof vi.fn>;
    };
  } = {},
) {
  const listProducts = new ListProducts(
    productRepository,
    overrides.categoryRepository ?? {
      findBySlug: vi.fn().mockResolvedValue(null),
      getDescendantIds: vi.fn().mockResolvedValue([]),
    },
  );

  return {
    listProducts,
    getCuratedCollection: createMockGetCuratedCollection(),
    curatedCollectionRepository: overrides.curatedCollectionRepository ?? {
      findById: vi.fn().mockResolvedValue(null),
    },
    contentRepository: overrides.contentRepository ?? {
      findArticleById: vi.fn().mockResolvedValue(null),
      listPublishedSummaries: vi.fn().mockResolvedValue([]),
    },
    productRepository,
    categoryRepository: overrides.categoryRepository ?? {
      findBySlug: vi.fn().mockResolvedValue(null),
      getDescendantIds: vi.fn().mockResolvedValue([]),
    },
  };
}

const PAGE_ID = 'f1111111-1111-4111-8111-111111111111';
const BLOCK_DYNAMIC_ID = 'f7111111-1111-4111-8111-111111111111';
const BLOCK_BENTO_HUB_MIX_ID = 'fa111111-1111-4111-8111-111111111111';
const COLLECTION_ID = 'c1111111-1111-4111-8111-111111111111';
const OFFER_PRODUCT_ID = 'a3333333-3333-4333-8333-333333333333';

function createProduct(
  id: string,
  slug: string,
  amount: number,
  stale: boolean,
  strikethrough?: number,
) {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: 'B001',
    slug,
    titleClean: 'Produto teste',
    titleRaw: 'Produto teste raw',
    price: Price.create({
      amount,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: stale,
      ...(strikethrough !== undefined ? { strikethrough } : {}),
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
    const freshProduct = createProduct(
      'a1111111-1111-4111-8111-111111111111',
      'cadeira-ergonomica-home-office',
      899.9,
      false,
    );
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
    const deps = createLayoutDeps(productRepository);
    const cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetPublishedPageLayout(
      pageRepository,
      cache,
      deps.listProducts,
      deps.getCuratedCollection,
      deps.curatedCollectionRepository,
      deps.contentRepository,
      deps.productRepository,
      deps.categoryRepository,
    );
    const layout = await useCase.execute('home');

    expect(layout).not.toBeNull();
    const dynamicBlock = layout?.blocks[0];
    expect(dynamicBlock?.type).toBe(BlockType.DYNAMIC_PRODUCT_GRID);
    expect(dynamicBlock?.renderedData).toHaveLength(1);
    expect(dynamicBlock?.renderedData?.[0]?.price.amount).toBe(899.9);
    expect(dynamicBlock?.renderedData?.[0]?.price.shouldShowPrice).toBe(true);
  });

  it('hydrates stale products with null amount on cache hit', async () => {
    const staleProduct = createProduct(
      'a1111111-1111-4111-8111-111111111111',
      'cadeira-ergonomica-home-office',
      899.9,
      true,
    );
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
    const deps = createLayoutDeps(productRepository);
    const cache = {
      get: vi.fn().mockResolvedValue(cachedLayout),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetPublishedPageLayout(
      pageRepository,
      cache,
      deps.listProducts,
      deps.getCuratedCollection,
      deps.curatedCollectionRepository,
      deps.contentRepository,
      deps.productRepository,
      deps.categoryRepository,
    );
    const layout = await useCase.execute('home');

    expect(pageRepository.findPublishedBySlug).not.toHaveBeenCalled();
    expect(layout?.blocks[0]?.renderedData).toEqual([]);
  });

  it('hydrates BENTO_HUB_MIX with renderedBentoHubMix', async () => {
    const offerProduct = createProduct(OFFER_PRODUCT_ID, 'teclado-mecanico-rgb', 329.9, false, 499.9);
    const listProduct = createProduct(
      'a2222222-2222-4222-8222-222222222222',
      'headset-gamer-7-1',
      249.9,
      false,
      399.9,
    );

    const collection = CuratedCollection.create({
      id: COLLECTION_ID,
      slug: 'setup-gamer-iniciante',
      title: 'Setup gamer iniciante',
      description: 'Seleção curada',
      coverImageUrl: 'https://example.com/cover.jpg',
      campaignOrigin: 'organico',
      utmDefaults: {},
      productIds: [],
      ctaText: 'Ver coleção',
    });

    const category = Category.create({
      id: 'a0222222-2222-4222-8222-222222222222',
      slug: 'games',
      label: 'Games',
      sortOrder: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
            id: BLOCK_BENTO_HUB_MIX_ID,
            pageId: PAGE_ID,
            type: BlockType.BENTO_HUB_MIX,
            sortOrder: 3,
            props: {
              slot1: {
                contentType: 'collection',
                entityId: COLLECTION_ID,
                title: 'Destaque gamer',
              },
              slot2: {
                productId: OFFER_PRODUCT_ID,
              },
              slot3: {
                contentType: 'category',
                categorySlug: 'games',
                listTitle: 'Top Games',
              },
            },
          }),
        ],
      }),
    });

    const productRepository = createMockProductRepository({
      findById: vi.fn().mockResolvedValue(offerProduct),
      findPublished: vi.fn().mockResolvedValue({ items: [listProduct], total: 1 }),
    });

    const categoryRepository = {
      findBySlug: vi.fn().mockResolvedValue(category),
      getDescendantIds: vi.fn().mockResolvedValue([category.id]),
    };

    const deps = createLayoutDeps(productRepository, {
      curatedCollectionRepository: {
        findById: vi.fn().mockResolvedValue(collection),
      },
      categoryRepository,
    });

    const cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetPublishedPageLayout(
      pageRepository,
      cache,
      deps.listProducts,
      deps.getCuratedCollection,
      deps.curatedCollectionRepository,
      deps.contentRepository,
      deps.productRepository,
      deps.categoryRepository,
    );

    const layout = await useCase.execute('home');
    const bentoBlock = layout?.blocks[0];

    expect(bentoBlock?.type).toBe(BlockType.BENTO_HUB_MIX);
    expect(bentoBlock?.renderedBentoHubMix?.slot1?.title).toBe('Destaque gamer');
    expect(bentoBlock?.renderedBentoHubMix?.slot1?.href).toBe('/colecoes/setup-gamer-iniciante');
    expect(bentoBlock?.renderedBentoHubMix?.slot2?.slug).toBe('teclado-mecanico-rgb');
    expect(bentoBlock?.renderedBentoHubMix?.slot3?.products).toHaveLength(1);
    expect(bentoBlock?.renderedBentoHubMix?.slot3?.categoryTitle).toBe('Top Games');
  });
});
