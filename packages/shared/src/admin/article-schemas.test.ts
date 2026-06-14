import { describe, expect, it } from 'vitest';

import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';
import {
  createArticleBodySchema,
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
});
