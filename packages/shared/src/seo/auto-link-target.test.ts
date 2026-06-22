import { describe, expect, it } from 'vitest';

import {
  AUTO_LINK_TARGET_URL_MAX_LENGTH,
  buildAutoLinkAnchorAttributes,
  describeExternalAutoLinkTarget,
  isExternalAutoLinkTargetUrl,
} from './auto-link-target.js';

describe('auto-link-target helpers', () => {
  it('detects external https targets', () => {
    expect(isExternalAutoLinkTargetUrl('https://www.amazon.com.br/dp/B001')).toBe(true);
    expect(isExternalAutoLinkTargetUrl('/produtos/cadeira')).toBe(false);
  });

  it('describes known marketplace hosts', () => {
    expect(describeExternalAutoLinkTarget('https://www.amazon.com.br/dp/B001')).toBe('Amazon');
    expect(describeExternalAutoLinkTarget('https://meli.la/32y878h')).toBe('Mercado Livre');
    expect(describeExternalAutoLinkTarget('https://shopee.com.br/produto/1')).toBe('Shopee');
    expect(describeExternalAutoLinkTarget('https://example.com/oferta')).toBe('Link externo');
    expect(describeExternalAutoLinkTarget('/produtos/cadeira')).toBeNull();
  });

  it('builds sponsored attributes for external urls', () => {
    const attrs = buildAutoLinkAnchorAttributes('https://www.amazon.com.br/dp/B001?tag=test');
    expect(attrs).toContain('href="https://www.amazon.com.br/dp/B001?tag=test"');
    expect(attrs).toContain('target="_blank"');
    expect(attrs).toContain('rel="noopener sponsored"');
  });

  it('keeps internal urls without sponsored attributes', () => {
    const attrs = buildAutoLinkAnchorAttributes('/produtos/cadeira');
    expect(attrs).toBe('href="/produtos/cadeira"');
  });

  it('exposes a generous max length for affiliate urls', () => {
    expect(AUTO_LINK_TARGET_URL_MAX_LENGTH).toBeGreaterThanOrEqual(1024);
  });
});
