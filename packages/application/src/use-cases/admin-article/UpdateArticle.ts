import {
  ArticleStatus,
  ContentArticle,
  EntityNotFoundError,
  type CacheStore,
  type ContentRepository,
} from '@ecommerce-amazon/domain';
import type { UpdateArticleBody } from '@ecommerce-amazon/shared/admin';

import { assertUniqueArticleSlug } from './article.helpers.js';

export class UpdateArticle {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(id: string, input: UpdateArticleBody): Promise<void> {
    const existing = await this.contentRepository.findArticleById(id);
    if (!existing) {
      throw new EntityNotFoundError('Article', id);
    }

    if (input.slug && input.slug !== existing.slug) {
      await assertUniqueArticleSlug(this.contentRepository, input.slug, id);
    }

    const now = new Date();
    const nextStatus = input.status ?? existing.status;
    let publishedAt = existing.publishedAt;
    if (nextStatus === ArticleStatus.PUBLISHED && !publishedAt) {
      publishedAt = now;
    }
    if (nextStatus === ArticleStatus.DRAFT) {
      publishedAt = null;
    }

    const article = ContentArticle.create({
      id: existing.id,
      slug: input.slug ?? existing.slug,
      title: input.title?.trim() ?? existing.title,
      excerpt: input.excerpt?.trim() ?? existing.excerpt,
      coverImageUrl:
        input.coverImageUrl !== undefined ? input.coverImageUrl : existing.coverImageUrl,
      body: input.body ?? existing.body,
      type: input.type ?? existing.type,
      status: nextStatus,
      authorId: existing.authorId,
      categoryId:
        input.categoryId !== undefined ? input.categoryId : existing.categoryId,
      seoTitle: input.seoTitle !== undefined ? input.seoTitle : existing.seoTitle,
      seoDescription:
        input.seoDescription !== undefined ? input.seoDescription : existing.seoDescription,
      seo: existing.seo,
      embeds: existing.embeds,
      publishedAt,
      createdAt: existing.createdAt,
      updatedAt: now,
    });

    await this.contentRepository.saveArticle(article);
    await this.cache.del(`vitrine:article:slug:${existing.slug}`);
    if (article.slug !== existing.slug) {
      await this.cache.del(`vitrine:article:slug:${article.slug}`);
    }
  }
}

export class DeleteArticle {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.contentRepository.findArticleById(id);
    if (!existing) {
      throw new EntityNotFoundError('Article', id);
    }

    await this.contentRepository.deleteArticle(id);
    await this.cache.del(`vitrine:article:slug:${existing.slug}`);
  }
}
