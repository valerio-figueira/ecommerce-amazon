import { describe, expect, it } from 'vitest';

import { parseMarketplaceProductUrl } from './parse-product-url.js';
import { slugifyTitle } from './slugify-title.js';

describe('parseMarketplaceProductUrl', () => {
  it('parses Amazon dp URLs', () => {
    expect(
      parseMarketplaceProductUrl('https://www.amazon.com.br/dp/B08411SMN5?tag=vitrine-20'),
    ).toEqual({ marketplace: 'amazon_br', externalId: 'B08411SMN5' });
  });

  it('parses Amazon SEO path dp URLs', () => {
    expect(
      parseMarketplaceProductUrl(
        'https://www.amazon.com.br/Monitor-AOC-DESTINY-FreeSync-25G3ZM/dp/B0CJ9NVNW6?tag=vitrine70-20',
      ),
    ).toEqual({ marketplace: 'amazon_br', externalId: 'B0CJ9NVNW6' });
  });

  it('parses Amazon gp/product URLs', () => {
    expect(parseMarketplaceProductUrl('https://www.amazon.com.br/gp/product/B08411SMN5')).toEqual({
      marketplace: 'amazon_br',
      externalId: 'B08411SMN5',
    });
  });

  it('parses Shopee product URLs', () => {
    expect(parseMarketplaceProductUrl('https://shopee.com.br/product/123456/789012')).toEqual({
      marketplace: 'shopee_br',
      externalId: '123456.789012',
    });
  });

  it('parses Shopee short i. URLs', () => {
    expect(parseMarketplaceProductUrl('https://shopee.com.br/Cadeira-i.123456.789012')).toEqual({
      marketplace: 'shopee_br',
      externalId: '123456.789012',
    });
  });

  it('parses Mercado Livre MLB URLs', () => {
    expect(
      parseMarketplaceProductUrl('https://produto.mercadolivre.com.br/MLB-1234567890-titulo'),
    ).toEqual({ marketplace: 'mercadolivre_br', externalId: 'MLB1234567890' });
  });

  it('returns null for unsupported hosts', () => {
    expect(parseMarketplaceProductUrl('https://example.com/product/1')).toBeNull();
  });
});

describe('slugifyTitle', () => {
  it('normalizes accents and spaces', () => {
    expect(slugifyTitle('Cadeira Ergonômica Pro X')).toBe('cadeira-ergonomica-pro-x');
  });
});
