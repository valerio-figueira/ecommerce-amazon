import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ArticleType } from '@ecommerce-amazon/domain';
import {
  articlePublicDetailSchema,
  resolveArticleUpdatedAtIso,
} from '@ecommerce-amazon/shared/admin';
import { comparisonPublicDetailSchema } from '@ecommerce-amazon/shared/comparison';

import { productDetailSchema } from './schemas';

const SHARE_TOKEN = '550e8400-e29b-41d4-a716-446655440000';

function makeComparisonProduct(slug: string) {
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

describe('web API contracts', () => {
  it('parses legacy comparison responses used by /comparar pages', () => {
    const parsed = comparisonPublicDetailSchema.parse({
      shareToken: SHARE_TOKEN,
      editorialIntro: 'Intro editorial longa '.repeat(20),
      createdAt: '2025-06-01T10:00:00.000Z',
      products: [makeComparisonProduct('cadeira'), makeComparisonProduct('mouse')],
    });

    expect(parsed.canonicalPath).toBe(`/comparar/${SHARE_TOKEN}`);
    expect(parsed.status).toBe('draft');
    expect(parsed.showCategoryCarousel).toBe(true);
  });

  it('normalizes article updatedAt for pages that depend on stable dates', () => {
    const parsed = articlePublicDetailSchema.parse({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'guia-teste',
      title: 'Guia',
      excerpt: 'Resumo',
      coverImageUrl: null,
      body: '<p>Conteúdo</p>',
      type: ArticleType.GUIDE,
      seoTitle: null,
      seoDescription: null,
      author: null,
      category: null,
      relatedArticles: [],
      publishedAt: '2025-01-15T12:00:00.000Z',
      embeddedProducts: {},
      cluster: null,
    });

    expect(parsed.updatedAt).toBe('2025-01-15T12:00:00.000Z');
    expect(resolveArticleUpdatedAtIso({ publishedAt: '2025-01-15T12:00:00.000Z' })).toBe(
      '2025-01-15T12:00:00.000Z',
    );
  });

  it('rejects malformed product detail payloads before they reach UI components', () => {
    expect(() =>
      productDetailSchema.parse({
        id: 'not-a-uuid',
        slug: 'produto',
        title: 'Produto',
      }),
    ).toThrow(z.ZodError);
  });
});
