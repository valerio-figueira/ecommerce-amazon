import { describe, expect, it } from 'vitest';

import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';
import {
  articlePublicDetailSchema,
  createArticleBodySchema,
  resolveArticleUpdatedAtIso,
  updateArticleBodySchema,
} from './article-schemas.js';

describe('article-schemas', () => {
  it('validates create article body', () => {
    const parsed = createArticleBodySchema.parse({
      slug: 'guia-cadeira-ergonomica',
      title: 'Guia de cadeira',
      body: '<p>Conteúdo</p>',
      type: ArticleType.GUIDE,
      status: ArticleStatus.DRAFT,
    });

    expect(parsed.slug).toBe('guia-cadeira-ergonomica');
  });

  it('allows partial update body', () => {
    const parsed = updateArticleBodySchema.parse({
      title: 'Novo título',
    });

    expect(parsed.title).toBe('Novo título');
    expect(parsed.body).toBeUndefined();
  });

  it('falls back updatedAt to publishedAt when missing from API payload', () => {
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
});
