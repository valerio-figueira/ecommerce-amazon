import { describe, expect, it } from 'vitest';

import { injectInternalLinks } from './link-parser.js';

describe('injectInternalLinks', () => {
  it('links keyword occurrences up to maxMatches', () => {
    const html =
      'A cadeira ergonômica é essencial. Outra cadeira ergonômica também ajuda no home office.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: 2 },
      { keyword: 'home office', targetUrl: '/categorias/home-office', maxMatches: 1 },
    ]);

    expect(result.match(/text-emerald-600/g)?.length).toBe(3);
    expect(result).toContain('href="/produtos/cadeira"');
    expect(result).toContain('href="/categorias/home-office"');
  });

  it('skips keywords inside existing anchor tags', () => {
    const html = '<a href="/existente">cadeira ergonômica</a> e cadeira ergonômica solta.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: 2 },
    ]);

    expect(result).toContain('<a href="/existente">cadeira ergonômica</a>');
    expect(result).toContain('href="/produtos/cadeira"');
    expect(result.match(/href="\/produtos\/cadeira"/g)?.length).toBe(1);
  });

  it('prefers longer keywords when priority is equal', () => {
    const html = 'Compre uma cadeira ergonômica para seu home office.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira', targetUrl: '/categorias/cadeiras', priority: 0 },
      {
        keyword: 'cadeira ergonômica',
        targetUrl: '/produtos/cadeira-ergonomica',
        priority: 0,
      },
    ]);

    expect(result).toContain('href="/produtos/cadeira-ergonomica"');
    expect(result).toContain('>cadeira ergonômica</a>');
    expect(result).not.toMatch(/href="\/categorias\/cadeiras">cadeira<\/a> ergonômica/);
  });

  it('processes higher priority keywords first', () => {
    const html = 'Oferta de headset gamer com desconto.';
    const result = injectInternalLinks(html, [
      { keyword: 'headset', targetUrl: '/categorias/headsets', priority: 1 },
      { keyword: 'headset gamer', targetUrl: '/produtos/headset-gamer', priority: 10 },
    ]);

    expect(result).toContain('href="/produtos/headset-gamer"');
    expect(result).toContain('>headset gamer</a>');
    expect(result.match(/href="\/categorias\/headsets"/g)?.length ?? 0).toBe(0);
  });

  it('does not inject links inside heading tags', () => {
    const html = '<h2>cadeira ergonômica</h2><p>cadeira ergonômica</p>';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: 2 },
    ]);

    expect(result).toContain('<h2>cadeira ergonômica</h2>');
    expect(result).toContain('<p><a href="/produtos/cadeira"');
    expect(result.match(/href="\/produtos\/cadeira"/g)?.length).toBe(1);
  });

  it('does not inject links inside img tags', () => {
    const html =
      '<img src="/foto.jpg" alt="cadeira ergonômica premium" /> Texto com cadeira ergonômica.';
    const result = injectInternalLinks(html, [
      { keyword: 'cadeira ergonômica', targetUrl: '/produtos/cadeira', maxMatches: 2 },
    ]);

    expect(result).toContain('alt="cadeira ergonômica premium"');
    expect(result.match(/href="\/produtos\/cadeira"/g)?.length).toBe(1);
  });
});
