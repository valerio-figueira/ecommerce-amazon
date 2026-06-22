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
