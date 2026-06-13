import { describe, expect, it } from 'vitest';

import {
  AffiliateLink,
  Marketplace,
  Price,
  PriceComplianceService,
  Product,
  ProductAvailability,
  TitleHygieneService,
} from '@ecommerce-amazon/domain';

describe('Price', () => {
  it('meetsTarget respects stale flag', () => {
    const stale = Price.create({
      amount: 50,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: true,
    });
    expect(stale.meetsTarget(100)).toBe(false);

    const fresh = Price.create({
      amount: 50,
      currency: 'BRL',
      updatedAt: new Date(),
      isStale: false,
    });
    expect(fresh.meetsTarget(100)).toBe(true);
    expect(fresh.meetsTarget(40)).toBe(false);
  });

  it('calculates drop percentage', () => {
    const current = Price.create({
      amount: 80,
      currency: 'BRL',
      updatedAt: new Date(),
    });
    const previous = Price.create({
      amount: 100,
      currency: 'BRL',
      updatedAt: new Date(),
    });
    expect(current.droppedByPercent(previous)).toBe(20);
  });
});

describe('PriceComplianceService', () => {
  it('marks price stale after 24 hours', () => {
    const service = new PriceComplianceService();
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000);
    expect(service.isStale(old)).toBe(true);

    const recent = new Date(Date.now() - 1 * 60 * 60 * 1000);
    expect(service.isStale(recent)).toBe(false);
  });
});

describe('Product', () => {
  it('emits PriceDropped when price decreases', () => {
    const product = Product.create({
      id: '11111111-1111-4111-8111-111111111111',
      marketplace: Marketplace.AMAZON_BR,
      externalId: 'B001',
      slug: 'test-product',
      titleClean: 'Test',
      titleRaw: 'Test Raw',
      price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
      affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
      images: [],
      specsNormalized: {},
      editorialScore: 80,
      availability: ProductAvailability.IN_STOCK,
      tags: [],
      createdAt: new Date(),
    });

    product.updatePrice(
      Price.create({ amount: 80, currency: 'BRL', updatedAt: new Date() }),
    );

    const events = product.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('PriceDropped');
  });
});

describe('TitleHygieneService', () => {
  it('removes promotional noise from titles', () => {
    const service = new TitleHygieneService();
    const cleaned = service.clean('Cadeira Ergonômica - Frete GRÁTIS OFERTA!');
    expect(cleaned).not.toMatch(/Frete GRÁTIS/i);
    expect(cleaned).not.toMatch(/OFERTA/i);
  });
});
