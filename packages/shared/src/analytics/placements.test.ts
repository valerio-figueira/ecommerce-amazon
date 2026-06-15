import { describe, expect, it } from 'vitest';

import { clickPlacementSchema, goAttributionQuerySchema } from './engagement-schemas.js';

describe('clickPlacementSchema', () => {
  it('accepts known placement values', () => {
    expect(clickPlacementSchema.parse('article.embed')).toBe('article.embed');
    expect(clickPlacementSchema.parse('cms.product_grid')).toBe('cms.product_grid');
  });

  it('rejects unknown placement values', () => {
    expect(() => clickPlacementSchema.parse('unknown.placement')).toThrow();
  });
});

describe('goAttributionQuerySchema', () => {
  it('parses optional attribution fields', () => {
    const parsed = goAttributionQuerySchema.parse({
      placement: 'article.embed',
      pagePath: '/artigos/guia-x',
      referrerPath: '/artigos',
      collectionId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(parsed.placement).toBe('article.embed');
    expect(parsed.pagePath).toBe('/artigos/guia-x');
  });
});
