import { describe, expect, it } from 'vitest';

import {
  comparisonPublicDetailSchema,
  resolveComparisonCanonicalPath,
  resolveComparisonUpdatedAtIso,
} from './comparison-schemas.js';

const SHARE_TOKEN = '550e8400-e29b-41d4-a716-446655440000';

function makeProduct(slug: string) {
  return {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    slug,
    title: `Produto ${slug}`,
    price: {
      amount: 199.9,
      currency: 'BRL',
      isStale: false,
      updatedAt: '2025-06-01T12:00:00.000Z',
    },
    marketplace: 'amazon_br',
    goUrl: `/go/${slug}`,
    editorialScore: 80,
    titleRaw: `Produto ${slug}`,
    externalId: 'B001TEST',
    availability: 'in_stock',
    images: ['https://cdn.example.com/image.jpg'],
    specs: { Peso: '1 kg' },
    similarProducts: [],
  };
}

function makeLegacyComparisonPayload() {
  return {
    shareToken: SHARE_TOKEN,
    editorialIntro: 'Texto editorial com pelo menos cento e cinquenta palavras '.repeat(8),
    createdAt: '2025-06-01T10:00:00.000Z',
    products: [makeProduct('cadeira-ergonomica'), makeProduct('mouse-gamer')],
  };
}

describe('comparisonPublicDetailSchema', () => {
  it('accepts legacy API payloads missing editorial phase-2 fields', () => {
    const parsed = comparisonPublicDetailSchema.parse(makeLegacyComparisonPayload());

    expect(parsed.status).toBe('draft');
    expect(parsed.showCategoryCarousel).toBe(true);
    expect(parsed.canonicalPath).toBe(`/comparar/${SHARE_TOKEN}`);
    expect(parsed.updatedAt).toBe('2025-06-01T10:00:00.000Z');
  });

  it('preserves published slug canonical path when API sends full payload', () => {
    const parsed = comparisonPublicDetailSchema.parse({
      ...makeLegacyComparisonPayload(),
      status: 'published',
      slug: 'cadeira-vs-mouse',
      showCategoryCarousel: false,
      canonicalPath: '/comparar/cadeira-vs-mouse',
      updatedAt: '2025-06-02T08:00:00.000Z',
      publishedAt: '2025-06-02T08:00:00.000Z',
    });

    expect(parsed.status).toBe('published');
    expect(parsed.showCategoryCarousel).toBe(false);
    expect(parsed.canonicalPath).toBe('/comparar/cadeira-vs-mouse');
    expect(parsed.updatedAt).toBe('2025-06-02T08:00:00.000Z');
  });

  it('derives canonical path from slug when published and canonicalPath is omitted', () => {
    expect(
      resolveComparisonCanonicalPath({
        shareToken: SHARE_TOKEN,
        slug: 'headset-vs-mouse',
        status: 'published',
      }),
    ).toBe('/comparar/headset-vs-mouse');
  });

  it('falls back updatedAt to createdAt when missing', () => {
    expect(
      resolveComparisonUpdatedAtIso({
        createdAt: '2025-06-01T10:00:00.000Z',
      }),
    ).toBe('2025-06-01T10:00:00.000Z');
  });
});
