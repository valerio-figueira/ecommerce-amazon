import { describe, expect, it } from 'vitest';

import { injectInternalLinks } from './link-parser.js';

describe('injectInternalLinks', () => {
  it('links the first occurrence of a keyword only once', () => {
    const html =
      '<p>A cadeira ergonômica ideal e outra cadeira ergonômica extra.</p>';
    const result = injectInternalLinks(html, [
      {
        keyword: 'cadeira ergonômica',
        targetUrl: '/produtos/cadeira-ergonomica-home-office',
      },
    ]);

    expect(result).toContain(
      '<a href="/produtos/cadeira-ergonomica-home-office" class="seo-internal-link">cadeira ergonômica</a>',
    );
    expect(result.match(/seo-internal-link/g)?.length).toBe(1);
  });

  it('does not replace keywords already inside anchor tags', () => {
    const html =
      '<p>Já linkado: <a href="/x">cadeira ergonômica</a> e cadeira ergonômica solta.</p>';
    const result = injectInternalLinks(html, [
      {
        keyword: 'cadeira ergonômica',
        targetUrl: '/produtos/cadeira-ergonomica-home-office',
      },
    ]);

    expect(result.match(/seo-internal-link/g)?.length).toBe(1);
    expect(result).toContain('<a href="/x">cadeira ergonômica</a>');
  });
});
