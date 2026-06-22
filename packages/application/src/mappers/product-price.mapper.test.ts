import { describe, expect, it } from 'vitest';

import {
  AffiliateLink,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
} from '@ecommerce-amazon/domain';

import { resolvePublicShouldShowPrice } from './product-price.mapper.js';

function createProduct(overrides: { stale?: boolean } = {}): Product {
  const product = Product.create({
    id: 'a1111111-1111-4111-8111-111111111111',
    marketplace: Marketplace.AMAZON_BR,
    externalId: 'B001',
    slug: 'produto-teste',
    titleClean: 'Produto',
    titleRaw: 'Produto Raw',
    price: Price.create({
      amount: 100,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: overrides.stale ?? false,
    }),
    affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
    images: [],
    specsNormalized: [],
    editorialScore: 80,
    availability: ProductAvailability.IN_STOCK,
    tags: [],
    createdAt: new Date(),
  });

  if (overrides.stale) {
    product.markPriceStale();
  }

  return product;
}

describe('resolvePublicShouldShowPrice', () => {
  it('shows price when platform and product allow it', () => {
    expect(resolvePublicShouldShowPrice(createProduct(), { pricesEnabled: true })).toBe(true);
  });

  it('hides price when platform prices are disabled', () => {
    expect(resolvePublicShouldShowPrice(createProduct(), { pricesEnabled: false })).toBe(false);
  });

  it('hides price when product price is stale even if platform allows prices', () => {
    expect(
      resolvePublicShouldShowPrice(createProduct({ stale: true }), { pricesEnabled: true }),
    ).toBe(false);
  });
});
