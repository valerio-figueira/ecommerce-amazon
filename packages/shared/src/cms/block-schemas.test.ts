import { describe, expect, it } from 'vitest';

import { dynamicProductGridPropsSchema } from './block-schemas.js';

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
