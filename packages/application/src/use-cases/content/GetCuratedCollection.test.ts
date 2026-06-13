import { describe, expect, it, vi } from 'vitest';

import {
  CuratedCollection,
  Product,
  ProductAvailability,
  AffiliateLink,
  Marketplace,
  Price,
} from '@ecommerce-amazon/domain';

import { GetCuratedCollection } from './GetCuratedCollection.js';

const COLLECTION_ID = 'c1111111-1111-4111-8111-111111111111';
const PRODUCT_A_ID = 'a1111111-1111-4111-8111-111111111111';
const PRODUCT_B_ID = 'b1111111-1111-4111-8111-111111111111';

function createProduct(id: string, slug: string) {
  return Product.create({
    id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: `EXT-${id.slice(0, 4)}`,
    slug,
    titleClean: `Product ${slug}`,
    titleRaw: `Product ${slug} raw`,
    price: Price.create({
      amount: 100,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: false,
    }),
    affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/test', 'amazon_br'),
    images: [],
    specsNormalized: {},
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
  });
}

describe('GetCuratedCollection', () => {
  it('preserves editorial sort order from collection productIds', async () => {
    const collection = CuratedCollection.create({
      id: COLLECTION_ID,
      slug: 'setup-gamer',
      title: 'Setup Gamer',
      description: 'Guia completo',
      coverImageUrl: 'https://example.com/cover.jpg',
      campaignOrigin: 'organico',
      utmDefaults: {},
      productIds: [PRODUCT_B_ID, PRODUCT_A_ID],
      ctaText: 'Ver coleção',
    });

    const collectionRepository = {
      findBySlug: vi.fn().mockResolvedValue(collection),
    };
    const productRepository = {
      findByIds: vi.fn().mockResolvedValue([
        createProduct(PRODUCT_A_ID, 'product-a'),
        createProduct(PRODUCT_B_ID, 'product-b'),
      ]),
    };
    const cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetCuratedCollection(
      collectionRepository as never,
      productRepository as never,
      cache,
    );
    const result = await useCase.execute('setup-gamer');

    expect(result?.products.map((product) => product.id)).toEqual([PRODUCT_B_ID, PRODUCT_A_ID]);
    expect(cache.set).toHaveBeenCalledOnce();
  });

  it('uses cached metadata and still reloads products in editorial order', async () => {
    const collectionRepository = {
      findBySlug: vi.fn(),
    };
    const productRepository = {
      findByIds: vi.fn().mockResolvedValue([
        createProduct(PRODUCT_A_ID, 'product-a'),
        createProduct(PRODUCT_B_ID, 'product-b'),
      ]),
    };
    const cache = {
      get: vi.fn().mockResolvedValue({
        collection: {
          id: COLLECTION_ID,
          slug: 'setup-gamer',
          title: 'Setup Gamer',
          description: 'Guia completo',
          coverImageUrl: 'https://example.com/cover.jpg',
          campaignOrigin: 'organico',
          utmDefaults: {},
          ctaText: 'Ver coleção',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
          productIds: [PRODUCT_B_ID, PRODUCT_A_ID],
        },
      }),
      set: vi.fn(),
      del: vi.fn(),
      increment: vi.fn(),
      getVersion: vi.fn(),
      incrementVersion: vi.fn(),
    };

    const useCase = new GetCuratedCollection(
      collectionRepository as never,
      productRepository as never,
      cache,
    );
    const result = await useCase.execute('setup-gamer');

    expect(collectionRepository.findBySlug).not.toHaveBeenCalled();
    expect(productRepository.findByIds).toHaveBeenCalledWith([PRODUCT_B_ID, PRODUCT_A_ID]);
    expect(result?.products.map((product) => product.id)).toEqual([PRODUCT_B_ID, PRODUCT_A_ID]);
    expect(result?.collection.updatedAt).toBeInstanceOf(Date);
  });
});
