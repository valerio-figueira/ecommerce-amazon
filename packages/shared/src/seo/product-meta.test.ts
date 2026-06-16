import { describe, expect, it } from 'vitest';

import {
  buildProductMetaDescription,
  buildProductMetaTitle,
  resolveProductMetaDescription,
  resolveProductMetaTitle,
} from './product-meta.js';

describe('product-meta', () => {
  it('builds default meta title from titleClean', () => {
    expect(buildProductMetaTitle('Elements Magna')).toBe(
      'Elements Magna — Análise e Ofertas',
    );
  });

  it('builds default meta description from titleClean', () => {
    expect(buildProductMetaDescription('Elements Magna')).toContain('Elements Magna');
    expect(buildProductMetaDescription('Elements Magna')).toContain('menor preço monitorado');
  });

  it('prefers editorial override for title and description', () => {
    expect(resolveProductMetaTitle('Elements Magna', 'Título customizado')).toBe(
      'Título customizado',
    );
    expect(resolveProductMetaDescription('Elements Magna', 'Descrição customizada')).toBe(
      'Descrição customizada',
    );
  });

  it('falls back to templates when override is empty', () => {
    expect(resolveProductMetaTitle('Elements Magna', '  ')).toBe(
      'Elements Magna — Análise e Ofertas',
    );
  });
});
