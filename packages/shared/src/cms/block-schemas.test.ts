import { describe, expect, it } from 'vitest';

import { bentoHubMixPropsSchema, dynamicProductGridPropsSchema } from './block-schemas.js';

describe('dynamicProductGridPropsSchema', () => {
  it('applies defaults for sortBy and limit', () => {
    const parsed = dynamicProductGridPropsSchema.parse({
      title: 'Ofertas do dia',
    });

    expect(parsed.sortBy).toBe('editorial_score');
    expect(parsed.limit).toBe(8);
  });

  it('validates optional filters and bounds', () => {
    const parsed = dynamicProductGridPropsSchema.parse({
      title: 'Home office',
      subtitle: 'Curadoria',
      categoryVertical: 'home-office',
      minDiscountPercentage: 20,
      sortBy: 'discount_percent_desc',
      limit: 12,
    });

    expect(parsed.categoryVertical).toBe('home-office');
    expect(parsed.minDiscountPercentage).toBe(20);
    expect(parsed.sortBy).toBe('discount_percent_desc');
    expect(parsed.limit).toBe(12);
  });

  it('rejects title shorter than 3 characters', () => {
    expect(() =>
      dynamicProductGridPropsSchema.parse({
        title: 'AB',
      }),
    ).toThrow();
  });
});

describe('bentoHubMixPropsSchema', () => {
  const validCollectionSlot = {
    slot1: {
      contentType: 'collection' as const,
      entityId: 'c1111111-1111-4111-8111-111111111111',
      title: 'Destaque',
    },
    slot2: {
      productId: 'a1111111-1111-4111-8111-111111111111',
    },
    slot3: {
      contentType: 'category' as const,
      categorySlug: 'games',
    },
  };

  it('validates collection + category configuration', () => {
    const parsed = bentoHubMixPropsSchema.parse(validCollectionSlot);
    expect(parsed.slot1.contentType).toBe('collection');
    expect(parsed.slot3.contentType).toBe('category');
  });

  it('requires cover image for article slot1', () => {
    expect(() =>
      bentoHubMixPropsSchema.parse({
        ...validCollectionSlot,
        slot1: {
          contentType: 'article',
          entityId: 'b1111111-1111-4111-8111-111111111111',
        },
      }),
    ).toThrow();
  });

  it('rejects more than 3 products in slot3', () => {
    expect(() =>
      bentoHubMixPropsSchema.parse({
        ...validCollectionSlot,
        slot3: {
          contentType: 'products',
          productIds: [
            'a1111111-1111-4111-8111-111111111111',
            'a2222222-2222-4222-8222-222222222222',
            'a3333333-3333-4333-8333-333333333333',
            'a4444444-4444-4444-8444-444444444444',
          ],
        },
      }),
    ).toThrow();
  });
});
