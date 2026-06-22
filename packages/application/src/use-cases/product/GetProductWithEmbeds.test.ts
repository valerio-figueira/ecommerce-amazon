import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateLink,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
} from '@ecommerce-amazon/domain';

import { createMockProductRepository } from '../../test/mock-factories.js';
import { GetProductWithEmbeds } from './GetProductWithEmbeds.js';

const categoryId = 'c1111111-1111-4111-8111-111111111111';

function createProduct(overrides: {
  id: string;
  slug: string;
  categoryId?: string;
  amount?: number;
}): Product {
  return Product.create({
    id: overrides.id,
    marketplace: Marketplace.AMAZON_BR,
    externalId: `ext-${overrides.id}`,
    slug: overrides.slug,
    titleClean: `Product ${overrides.slug}`,
    titleRaw: `Product ${overrides.slug} raw`,
    price: Price.create({
      amount: overrides.amount ?? 100,
      currency: 'BRL',
      updatedAt: new Date(),
    }),
    affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/test', 'amazon_br'),
    images: ['https://example.com/image.jpg'],
    specsNormalized: [],
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    visible: true,
    ...(overrides.categoryId !== undefined ? { categoryId: overrides.categoryId } : {}),
    createdAt: new Date(),
  });
}

describe('GetProductWithEmbeds', () => {
  it('returns null when product is not found', async () => {
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(null),
    });

    const useCase = new GetProductWithEmbeds(productRepository);
    const result = await useCase.execute('missing-slug');

    expect(result).toBeNull();
    expect(productRepository.findSimilarPublishedByCategory).not.toHaveBeenCalled();
  });

  it('returns empty similarProducts when product has no category', async () => {
    const product = createProduct({
      id: 'a1111111-1111-4111-8111-111111111111',
      slug: 'cadeira-sem-categoria',
    });
    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(product),
    });

    const useCase = new GetProductWithEmbeds(productRepository);
    const result = await useCase.execute(product.slug);

    expect(result?.similarProducts).toEqual([]);
    expect(productRepository.findSimilarPublishedByCategory).not.toHaveBeenCalled();
  });

  it('loads similar products from the same category excluding the current product', async () => {
    const product = createProduct({
      id: 'a1111111-1111-4111-8111-111111111111',
      slug: 'cadeira-atual',
      categoryId,
      amount: 500,
    });
    const similarA = createProduct({
      id: 'b2222222-2222-4222-8222-222222222222',
      slug: 'cadeira-barata',
      categoryId,
      amount: 300,
    });
    const similarB = createProduct({
      id: 'c3333333-3333-4333-8333-333333333333',
      slug: 'cadeira-media',
      categoryId,
      amount: 400,
    });

    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(product),
      findSimilarPublishedByCategory: vi.fn().mockResolvedValue([similarA, similarB]),
    });

    const useCase = new GetProductWithEmbeds(productRepository);
    const result = await useCase.execute(product.slug);

    expect(productRepository.findSimilarPublishedByCategory).toHaveBeenCalledWith({
      categoryId,
      excludeProductId: product.id,
      limit: 12,
    });
    expect(result?.similarProducts).toEqual([similarA, similarB]);
    expect(result?.similarProducts.some((item) => item.id === product.id)).toBe(false);
  });

  it('loads embedded products referenced in longDescriptionHtml', async () => {
    const product = createProduct({
      id: 'a1111111-1111-4111-8111-111111111111',
      slug: 'cadeira-atual',
      categoryId,
    });
    product.longDescriptionHtml =
      '<p>Veja também [[product:mouse-logitech]] e [[product:teclado-mecanico]]</p>';
    const mouse = createProduct({
      id: 'b2222222-2222-4222-8222-222222222222',
      slug: 'mouse-logitech',
      categoryId,
    });

    const productRepository = createMockProductRepository({
      findBySlug: vi.fn(async (slug: string) => {
        if (slug === product.slug) return product;
        if (slug === 'mouse-logitech') return mouse;
        return null;
      }),
      findSimilarPublishedByCategory: vi.fn().mockResolvedValue([]),
    });

    const useCase = new GetProductWithEmbeds(productRepository);
    const result = await useCase.execute(product.slug);

    expect(result?.embeddedProducts).toEqual({
      'mouse-logitech': mouse,
      'teclado-mecanico': null,
    });
    expect(result?.embeddedProducts['cadeira-atual']).toBeUndefined();
  });
});
