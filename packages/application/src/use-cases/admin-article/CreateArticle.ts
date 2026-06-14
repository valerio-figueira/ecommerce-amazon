import { randomUUID } from 'node:crypto';

import {
  ArticleStatus,
  ContentArticle,
  type CacheStore,
  type ContentRepository,
} from '@ecommerce-amazon/domain';
import type { CreateArticleBody } from '@ecommerce-amazon/shared/admin';

import { assertUniqueArticleSlug } from './article.helpers.js';

export class CreateArticle {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(
    input: CreateArticleBody,
    authorId: string,
  ): Promise<{ id: string }> {
    await assertUniqueArticleSlug(this.contentRepository, input.slug);

    const now = new Date();
    const publishedAt = input.status === ArticleStatus.PUBLISHED ? now : null;

    const article = ContentArticle.create({
      id: randomUUID(),
      slug: input.slug,
      title: input.title.trim(),
      excerpt: input.excerpt?.trim() ?? '',
      coverImageUrl: input.coverImageUrl ?? null,
      body: input.body,
      type: input.type,
      status: input.status ?? ArticleStatus.DRAFT,
      authorId,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      embeds: [],
      publishedAt,
      createdAt: now,
      updatedAt: now,
    });

    await this.contentRepository.saveArticle(article);
    await this.cache.del(`vitrine:article:slug:${article.slug}`);

    return { id: article.id };
  }
}

export class GetAdminArticle {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(id: string) {
    const article = await this.contentRepository.findArticleById(id);
    if (!article) return null;

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      coverImageUrl: article.coverImageUrl,
      body: article.body,
      type: article.type,
      status: article.status,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      authorId: article.authorId,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}
