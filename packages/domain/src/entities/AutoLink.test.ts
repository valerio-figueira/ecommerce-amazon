import { describe, expect, it } from 'vitest';

import { AutoLink } from './AutoLink.js';

describe('AutoLink', () => {
  it('creates a valid auto link with defaults', () => {
    const link = AutoLink.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      keyword: 'cadeira ergonômica',
      targetUrl: '/produtos/cadeira-ergonomica',
    });

    expect(link.keyword).toBe('cadeira ergonômica');
    expect(link.targetUrl).toBe('/produtos/cadeira-ergonomica');
    expect(link.maxMatches).toBe(1);
    expect(link.priority).toBe(0);
    expect(link.isActive).toBe(true);
  });

  it('accepts https target urls', () => {
    const link = AutoLink.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      keyword: 'oferta',
      targetUrl: 'https://example.com/oferta',
    });

    expect(link.targetUrl).toBe('https://example.com/oferta');
  });

  it('accepts long marketplace affiliate urls', () => {
    const affiliateUrl =
      'https://www.amazon.com.br/dp/B08411SMN5?tag=vitrine-20&linkCode=ogi&th=1&psc=1&ref_=as_li_ss_tl&camp=1789&creative=9325&creativeASIN=B08411SMN5';
    const link = AutoLink.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      keyword: 'oferta amazon',
      targetUrl: affiliateUrl,
    });

    expect(link.targetUrl).toBe(affiliateUrl);
  });

  it('rejects empty keyword', () => {
    expect(() =>
      AutoLink.create({
        id: 'a1111111-1111-4111-8111-111111111111',
        keyword: '   ',
        targetUrl: '/produtos/teste',
      }),
    ).toThrow('Keyword deve ter entre 1 e 120 caracteres');
  });

  it('rejects invalid target url', () => {
    expect(() =>
      AutoLink.create({
        id: 'a1111111-1111-4111-8111-111111111111',
        keyword: 'oferta',
        targetUrl: 'http://inseguro.com',
      }),
    ).toThrow('URL de destino inválida');
  });

  it('rejects maxMatches below 1', () => {
    expect(() =>
      AutoLink.create({
        id: 'a1111111-1111-4111-8111-111111111111',
        keyword: 'oferta',
        targetUrl: '/produtos/teste',
        maxMatches: 0,
      }),
    ).toThrow('maxMatches deve ser um inteiro maior ou igual a 1');
  });

  it('supports immutable updates and toggle active state', () => {
    const link = AutoLink.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      keyword: 'oferta',
      targetUrl: '/produtos/teste',
      isActive: true,
    });

    const deactivated = link.deactivate();
    expect(deactivated.isActive).toBe(false);
    expect(link.isActive).toBe(true);

    const updated = link.withUpdates({ priority: 5, maxMatches: 3 });
    expect(updated.priority).toBe(5);
    expect(updated.maxMatches).toBe(3);
  });
});
