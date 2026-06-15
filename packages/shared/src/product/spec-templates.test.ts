import { describe, expect, it } from 'vitest';

import { resolveSpecTemplateForSlugChain } from './spec-templates.js';

describe('resolveSpecTemplateForSlugChain', () => {
  it('returns leaf template when slug chain includes a matching leaf', () => {
    expect(resolveSpecTemplateForSlugChain(['games', 'perifericos', 'teclados-mecanicos'])).toEqual([
      'Switches',
      'Layout',
      'Conexão',
    ]);
  });

  it('falls back to parent slug when leaf has no template', () => {
    expect(resolveSpecTemplateForSlugChain(['games', 'perifericos', 'headsets-gamer'])).toEqual([
      'Tipo',
      'Conexão',
      'Compatibilidade',
    ]);
  });

  it('returns empty array when no slug in chain matches', () => {
    expect(resolveSpecTemplateForSlugChain(['home-office', 'eletronicos'])).toEqual([]);
  });

  it('returns empty array for empty slug chain', () => {
    expect(resolveSpecTemplateForSlugChain([])).toEqual([]);
  });
});
