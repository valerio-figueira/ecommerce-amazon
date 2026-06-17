import { ArticleStatus, ArticleType, ContentArticle } from '@ecommerce-amazon/domain';
import type { ArticleWithEmbedsResult } from '@ecommerce-amazon/application';
import { describe, expect, it } from 'vitest';

import { toArticlePublicDetailDto } from './article.presenter.js';

function buildArticleResult(
  overrides: Partial<ArticleWithEmbedsResult> = {},
): ArticleWithEmbedsResult {
  const publishedAt = new Date('2026-01-10T12:00:00.000Z');
  const article = ContentArticle.create({
    id: 'b1111111-1111-4111-8111-111111111111',
    slug: 'cadeira-ergonomica-vs-gamer',
    title: 'Cadeira ergonômica vs gamer',
    excerpt: 'Comparativo editorial',
    coverImageUrl: null,
    body: '<p>Conteúdo</p>',
    type: ArticleType.COMPARISON,
    status: ArticleStatus.PUBLISHED,
    seoTitle: null,
    seoDescription: null,
    seo: {},
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
  });

  return {
    article,
    author: null,
    category: null,
    relatedArticles: [
      {
        id: 'c2222222-2222-4222-8222-222222222222',
        slug: 'ajuste-lombar-cadeira-ergonomica',
        title: 'Ajuste lombar',
        coverImageUrl: null,
        publishedAt: '2026-01-03T12:00:00.000Z',
      },
    ],
    embeddedProducts: {},
    cluster: {
      name: 'Especial Cadeira Ergonômica',
      slug: 'especial-cadeira-ergonomica',
      description: null,
      role: 'spoke',
      pilarArticle: {
        slug: 'guia-cadeira-ergonomica',
        title: 'Guia pilar',
      },
      members: [
        {
          id: 'd3333333-3333-4333-8333-333333333333',
          slug: 'guia-cadeira-ergonomica',
          title: 'Guia pilar',
          excerpt: 'Pilar',
          coverImageUrl: null,
          publishedAt: '2026-01-01T12:00:00.000Z',
          isPilar: true,
        },
      ],
    },
    ...overrides,
  };
}

describe('toArticlePublicDetailDto', () => {
  it('serializes cached string dates from related articles and cluster members', () => {
    const dto = toArticlePublicDetailDto(buildArticleResult());

    expect(dto.relatedArticles[0]?.publishedAt).toBe('2026-01-03T12:00:00.000Z');
    expect(dto.cluster?.members[0]?.publishedAt).toBe('2026-01-01T12:00:00.000Z');
  });
});
