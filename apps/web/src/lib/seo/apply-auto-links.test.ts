import { describe, expect, it } from 'vitest';

import { applyAutoLinksToHtml } from './apply-auto-links';

describe('applyAutoLinksToHtml', () => {
  it('injects configured auto-links into html content', () => {
    const html = '<p>Confira esta cadeira ergonômica para home office.</p>';
    const result = applyAutoLinksToHtml(html, [
      {
        keyword: 'cadeira ergonômica',
        targetUrl: '/produtos/cadeira-ergonomica',
        maxMatches: 1,
        priority: 5,
      },
    ]);

    expect(result).toContain('href="/produtos/cadeira-ergonomica"');
    expect(result).toContain('>cadeira ergonômica</a>');
  });
});
