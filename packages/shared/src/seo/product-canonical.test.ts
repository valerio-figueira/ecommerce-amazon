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

  it('prefers editorial override from database when provided', () => {
    expect(
      resolveProductCanonicalUrl(
        'cadeira-gamer-rhino',
        'https://www.exemplo.com.br',
        'https://www.exemplo.com.br/produtos/cadeira-ergonomica-rhino',
      ),
    ).toBe('https://www.exemplo.com.br/produtos/cadeira-ergonomica-rhino');
  });

  it('falls back to slug path when override is null or empty', () => {
    expect(resolveProductCanonicalUrl('cadeira-dt3-rhino', 'https://www.exemplo.com.br', null)).toBe(
      'https://www.exemplo.com.br/produtos/cadeira-dt3-rhino',
    );
    expect(resolveProductCanonicalUrl('cadeira-dt3-rhino', 'https://www.exemplo.com.br', '  ')).toBe(
      'https://www.exemplo.com.br/produtos/cadeira-dt3-rhino',
    );
  });
});
