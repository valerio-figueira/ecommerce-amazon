import { describe, expect, it } from 'vitest';

import { buildComparisonEditorialIntro } from './build-editorial-intro.js';

describe('buildComparisonEditorialIntro', () => {
  it('generates intro with at least 150 words and 150 characters', () => {
    const intro = buildComparisonEditorialIntro({
      categoryLabel: 'Smartphones',
      products: [
        { title: 'Celular A', marketplace: 'amazon_br', editorialScore: 8.2 },
        { title: 'Celular B', marketplace: 'shopee_br', editorialScore: 7.5 },
      ],
    });

    expect(intro.length).toBeGreaterThanOrEqual(150);
    expect(intro.split(/\s+/).filter(Boolean).length).toBeGreaterThanOrEqual(150);
    expect(intro).toContain('Smartphones');
    expect(intro).toContain('Celular A');
    expect(intro).toContain('Celular B');
  });
});
