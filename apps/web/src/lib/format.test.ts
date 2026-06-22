import { describe, expect, it } from 'vitest';

import {
  affiliatePriceCtaLabel,
  marketplaceLabel,
  marketplaceWithDefiniteArticle,
  marketplaceWithPreposition,
} from './format';

describe('marketplaceLabel', () => {
  it('maps known marketplaces', () => {
    expect(marketplaceLabel('amazon_br')).toBe('Amazon');
    expect(marketplaceLabel('shopee_br')).toBe('Shopee');
    expect(marketplaceLabel('mercadolivre_br')).toBe('Mercado Livre');
  });
});

describe('marketplaceWithPreposition', () => {
  it('uses feminine contracted preposition for Amazon and Shopee', () => {
    expect(marketplaceWithPreposition('amazon_br')).toBe('na Amazon');
    expect(marketplaceWithPreposition('shopee_br')).toBe('na Shopee');
  });

  it('uses masculine contracted preposition for Mercado Livre', () => {
    expect(marketplaceWithPreposition('mercadolivre_br')).toBe('no Mercado Livre');
  });
});

describe('marketplaceWithDefiniteArticle', () => {
  it('uses feminine article for Amazon and Shopee', () => {
    expect(marketplaceWithDefiniteArticle('amazon_br')).toBe('a Amazon');
    expect(marketplaceWithDefiniteArticle('shopee_br')).toBe('a Shopee');
  });

  it('uses masculine article for Mercado Livre', () => {
    expect(marketplaceWithDefiniteArticle('mercadolivre_br')).toBe('o Mercado Livre');
  });
});

describe('affiliatePriceCtaLabel', () => {
  it('builds transparent affiliate CTA copy per marketplace', () => {
    expect(affiliatePriceCtaLabel('amazon_br')).toBe('Ver na Amazon');
    expect(affiliatePriceCtaLabel('shopee_br')).toBe('Ver na Shopee');
    expect(affiliatePriceCtaLabel('mercadolivre_br')).toBe('Ver no Mercado Livre');
  });
});
