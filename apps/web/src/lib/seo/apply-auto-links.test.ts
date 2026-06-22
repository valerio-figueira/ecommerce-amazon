import { describe, expect, it } from 'vitest';

import { applyAutoLinksToHtml } from './apply-auto-links';

describe('applyAutoLinksToHtml', () => {
  it('injects only rules for the requested surface and routes affiliates through /go', () => {
    const html = '<p>Veja esta cadeira ergonômica e também cadeira gamer.</p>';
    const result = applyAutoLinksToHtml(
      html,
      [
        {
          id: 'a1111111-1111-4111-8111-111111111111',
          keyword: 'cadeira ergonômica',
          targetUrl: '/produtos/cadeira-ergonomica',
          maxMatches: 1,
          priority: 5,
          applyTo: 'products',
        },
        {
          id: 'b2222222-2222-4222-8222-222222222222',
          keyword: 'cadeira gamer',
          targetUrl: '/artigos/guia-cadeira',
          maxMatches: 1,
          priority: 5,
          applyTo: 'articles',
        },
      ],
      'products',
      { pagePath: '/produtos/teste' },
    );

    expect(result).toContain('/go/cadeira-ergonomica?');
    expect(result).not.toContain('/artigos/guia-cadeira');
    expect(result).toContain('>cadeira ergonômica</a>');
    expect(result).not.toContain('>cadeira gamer</a>');
  });
});
