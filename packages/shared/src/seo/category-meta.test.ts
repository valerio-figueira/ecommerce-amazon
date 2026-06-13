import { describe, expect, it } from 'vitest';

import {
  buildCategorySeoDescription,
  buildCategorySeoTitle,
  resolveCategorySeoDescription,
  resolveCategorySeoTitle,
} from './category-meta.js';

describe('category-meta', () => {
  it('builds default SEO title from label', () => {
    expect(buildCategorySeoTitle('Teclados Mecânicos')).toBe(
      'Teclados Mecânicos | Melhores Ofertas e Análises',
    );
  });

  it('builds default SEO description from label', () => {
    expect(buildCategorySeoDescription('Teclados Mecânicos')).toContain('Teclados Mecânicos');
    expect(buildCategorySeoDescription('Teclados Mecânicos', 'Periféricos')).toContain(
      'em Periféricos',
    );
  });

  it('prefers editorial override for title and description', () => {
    expect(resolveCategorySeoTitle('Teclados', 'Título customizado')).toBe('Título customizado');
    expect(resolveCategorySeoDescription('Teclados', 'Descrição customizada')).toBe(
      'Descrição customizada',
    );
  });

  it('falls back to templates when override is empty', () => {
    expect(resolveCategorySeoTitle('Teclados', '  ')).toBe(
      'Teclados | Melhores Ofertas e Análises',
    );
  });
});
