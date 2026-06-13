import { describe, expect, it } from 'vitest';

import {
  buildProductCanonicalUrl,
  normalizeSiteBaseUrl,
  resolveProductCanonicalUrl,
} from './product-canonical.js';

describe('product-canonical', () => {
  it('builds default product canonical from slug', () => {
    expect(buildProductCanonicalUrl('https://www.exemplo.com.br', 'cadeira-dt3-rhino')).toBe(
      'https://www.exemplo.com.br/produtos/cadeira-dt3-rhino',
    );
  });

  it('strips trailing slash from site base', () => {
    expect(normalizeSiteBaseUrl('https://www.exemplo.com.br/')).toBe('https://www.exemplo.com.br');
  });

  it('prefers manual override when provided', () => {
    expect(
      resolveProductCanonicalUrl(
        'cadeira-dt3-rhino',
        'https://www.exemplo.com.br',
        'https://www.exemplo.com.br/produtos/cadeira-dt3-rhino',
      ),
    ).toBe('https://www.exemplo.com.br/produtos/cadeira-dt3-rhino');
  });

  it('falls back to slug path when override is empty', () => {
    expect(resolveProductCanonicalUrl('cadeira-dt3-rhino', 'https://www.exemplo.com.br', '  ')).toBe(
      'https://www.exemplo.com.br/produtos/cadeira-dt3-rhino',
    );
  });
});
