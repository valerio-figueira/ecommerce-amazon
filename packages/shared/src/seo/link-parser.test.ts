import { describe, expect, it } from 'vitest';

import { injectInternalLinks } from './link-parser.js';

describe('injectInternalLinks', () => {
  it('links keyword occurrences up to maxMatches', () => {
    const html =
      'A cadeira ergonômica é essencial. Outra cadeira ergonômica também ajuda no home office.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: +2 },
      { keyword: 'home office', targetUrl: '/categorias/home-office', maxMatches: 1 },
    ]);

    expect(result.match(/text-emerald-600/g)?.length).toBe(3);
    expect(result).toContain('href="/produtos/cadeira"');
    expect(result).toContain('href="/categorias/home-office"');
  });

  it('skips keywords inside existing anchor tags', () => {
    const html =
      '<a href="/existente">cadeira ergonômica</a> e cadeira ergonômica solta.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: 2 },
    ]);

    expect(result).toContain('<a href="/existente">cadeira ergonômica</a>');
    expect(result).toContain('href="/produtos/cadeira"');
    expect(result.match(/href="\/produtos\/cadeira"/g)?.length).toBe(1);
  });
});
