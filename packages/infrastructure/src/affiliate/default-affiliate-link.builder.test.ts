import { describe, expect, it } from 'vitest';

import { Marketplace } from '@ecommerce-amazon/domain';

import { DefaultAffiliateLinkBuilder } from './default-affiliate-link.builder.js';

describe('DefaultAffiliateLinkBuilder', () => {
  const builder = new DefaultAffiliateLinkBuilder('amazon-tag', 'shopee-id');

  describe('appendTrackingToStoredUrl', () => {
    it('appends telemetry params to Mercado Livre meli.la links without rebuilding product URL', () => {
      const result = builder.appendTrackingToStoredUrl(
        'https://meli.la/32y878h',
        Marketplace.MERCADOLIVRE_BR,
        { origin: 'listagem', blockId: 'block-1', sessionId: 'session-1' },
      );

      const url = new URL(result);
      expect(url.origin + url.pathname).toBe('https://meli.la/32y878h');
      expect(url.searchParams.get('utm_source')).toBe('listagem');
    });

    it('preserves existing query params on stored Mercado Livre links', () => {
      const result = builder.appendTrackingToStoredUrl(
        'https://meli.la/abc?foo=bar',
        Marketplace.MERCADOLIVRE_BR,
        { origin: 'detalhe' },
      );

      const url = new URL(result);
      expect(url.searchParams.get('foo')).toBe('bar');
      expect(url.searchParams.get('utm_source')).toBe('detalhe');
    });

    it('preserves Amazon SiteStripe tag and appends ascsubtag', () => {
      const storedUrl =
        'https://www.amazon.com.br/Monitor-AOC-DESTINY-FreeSync-25G3ZM/dp/B0CJ9NVNW6?tag=vitrine70-20';
      const result = builder.appendTrackingToStoredUrl(
        storedUrl,
        Marketplace.AMAZON_BR,
        { origin: 'redirect_go', blockId: 'block-1' },
        'vitrine-21',
      );

      const url = new URL(result);
      expect(url.searchParams.get('tag')).toBe('vitrine70-20');
      expect(url.searchParams.get('ascsubtag')).toContain('redirect_go');
      expect(url.pathname).toContain('B0CJ9NVNW6');
    });

    it('adds Amazon tag from account when stored URL has no tag', () => {
      const result = builder.appendTrackingToStoredUrl(
        'https://www.amazon.com.br/dp/B0CJ9NVNW6',
        Marketplace.AMAZON_BR,
        { origin: 'listagem' },
        'vitrine-21',
      );

      const url = new URL(result);
      expect(url.searchParams.get('tag')).toBe('vitrine-21');
    });
  });

  describe('buildWithTracking', () => {
    it('still rebuilds Mercado Livre URLs from externalId when called directly', () => {
      const result = builder.buildWithTracking(Marketplace.MERCADOLIVRE_BR, 'MLB1234567890', {
        origin: 'listagem',
      });

      expect(result).toBe('https://produto.mercadolivre.com.br/MLB1234567890?utm_source=listagem');
    });
  });
});
