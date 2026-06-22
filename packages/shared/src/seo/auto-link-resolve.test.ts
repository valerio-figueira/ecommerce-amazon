import { describe, expect, it } from 'vitest';

import {
  buildAutoLinkExternalGoUrl,
  buildAutoLinkProductGoUrl,
  filterAutoLinksForSurface,
  resolveAutoLinkHref,
} from './auto-link-resolve.js';

describe('auto-link-resolve', () => {
  const rules = [
    {
      id: 'a1111111-1111-4111-8111-111111111111',
      keyword: 'artigo',
      targetUrl: '/artigos/guia',
      maxMatches: 1,
      applyTo: 'articles' as const,
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      keyword: 'produto',
      targetUrl: '/produtos/cadeira',
      maxMatches: 1,
      applyTo: 'products' as const,
    },
    {
      id: 'c3333333-3333-4333-8333-333333333333',
      keyword: 'amazon',
      targetUrl: 'https://www.amazon.com.br/dp/B001?tag=test',
      maxMatches: 1,
      applyTo: 'both' as const,
    },
  ];

  it('filters rules by surface', () => {
    expect(filterAutoLinksForSurface(rules, 'articles')).toHaveLength(2);
    expect(filterAutoLinksForSurface(rules, 'products')).toHaveLength(2);
  });

  it('routes product targets through /go', () => {
    const href = resolveAutoLinkHref(rules[1]!, 'products', {
      pagePath: '/produtos/cadeira',
    });
    expect(href).toContain('/go/cadeira?');
    expect(href).toContain('origin=auto_link');
    expect(href).toContain('placement=auto_link.product');
    expect(href).toContain('pagePath=%2Fprodutos%2Fcadeira');
  });

  it('routes external affiliate targets through /go/alink', () => {
    const href = resolveAutoLinkHref(rules[2]!, 'articles', {
      articleId: 'd4444444-4444-4444-8444-444444444444',
    });
    expect(href).toContain('/go/alink/c3333333-3333-4333-8333-333333333333?');
    expect(href).toContain('placement=auto_link.article');
    expect(href).toContain('articleId=d4444444-4444-4444-8444-444444444444');
  });

  it('keeps internal non-product urls unchanged', () => {
    const href = resolveAutoLinkHref(rules[0]!, 'articles');
    expect(href).toBe('/artigos/guia');
  });

  it('builds product go urls', () => {
    expect(buildAutoLinkProductGoUrl('mouse-gamer', 'articles')).toContain('/go/mouse-gamer?');
    expect(
      buildAutoLinkExternalGoUrl('c3333333-3333-4333-8333-333333333333', 'products'),
    ).toContain('/go/alink/c3333333-3333-4333-8333-333333333333?');
  });
});
