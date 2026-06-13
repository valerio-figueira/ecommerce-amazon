import { describe, expect, it } from 'vitest';

import {
  buildShortDescriptionFromPros,
  resolveProductShortDescription,
} from './product-short-description.js';

describe('product-short-description', () => {
  it('builds short description from top pros', () => {
    expect(
      buildShortDescriptionFromPros(['Apoio lombar', 'Braços ajustáveis', 'Montagem fácil']),
    ).toBe('Principais qualidades: Apoio lombar, Braços ajustáveis e Montagem fácil.');
  });

  it('returns undefined when there are no pros', () => {
    expect(buildShortDescriptionFromPros([])).toBeUndefined();
  });

  it('prefers custom short description over generated text', () => {
    expect(resolveProductShortDescription('Texto customizado', ['Apoio lombar'])).toBe(
      'Texto customizado',
    );
  });

  it('generates from pros when custom value is empty', () => {
    expect(resolveProductShortDescription('', ['Apoio lombar'])).toBe('Destaque: Apoio lombar.');
  });
});
