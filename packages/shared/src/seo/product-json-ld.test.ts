import { describe, expect, it } from 'vitest';

import { buildProductJsonLd } from './product-json-ld.js';

const baseProduct = {
  slug: 'cadeira-ergonomica-home-office',
  titleClean: 'Cadeira Ergonômica',
  titleRaw: 'Cadeira Ergonômica Raw',
  externalId: 'B001',
  id: 'a1111111-1111-4111-8111-111111111111',
  marketplace: 'amazon_br',
  images: ['https://example.com/img.jpg'],
  availability: 'in_stock',
  siteBaseUrl: 'https://vitrine.local',
};

describe('buildProductJsonLd', () => {
  it('includes offers when shouldShowPrice is true', () => {
    const jsonLd = buildProductJsonLd({
      ...baseProduct,
      shouldShowPrice: true,
      price: { amount: 899.9, currency: 'BRL' },
    });

    expect(jsonLd['offers']).toEqual({
      '@type': 'Offer',
      url: 'https://vitrine.local/go/cadeira-ergonomica-home-office',
      priceCurrency: 'BRL',
      price: 899.9,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
    });
  });

  it('omits offers when price is stale', () => {
    const jsonLd = buildProductJsonLd({
      ...baseProduct,
      shouldShowPrice: false,
    });

    expect(jsonLd['offers']).toBeUndefined();
  });
});
