import { randomUUID } from 'node:crypto';

import {
  ArticleStatus,
  ContentArticle,
  type CacheStore,
  type ContentClusterRepository,
  type ContentRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { CreateArticleBody } from '@ecommerce-amazon/shared/admin';

import {
  buildArticlePublicPaths,
  invalidateArticlePublicCache,
} from '../../cache/public-cache.helpers.js';
import { invalidateClusterArticleCaches } from '../content-cluster/content-cluster.helpers.js';
import { assertUniqueArticleSlug } from './article.helpers.js';

export class CreateArticle {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly contentClusterRepository: ContentClusterRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: CreateArticleBody, authorId: string): Promise<{ id: string }> {
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
      categoryId: input.categoryId ?? null,
      clusterId: input.clusterId ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      embeds: [],
      publishedAt,
      createdAt: now,
      updatedAt: now,
    });

    await this.contentRepository.saveArticle(article);
    await invalidateArticlePublicCache(this.cache, [article.slug]);

    if (article.clusterId) {
      const slugs = await invalidateClusterArticleCaches(
        this.contentClusterRepository,
        this.cache,
        article.clusterId,
      );
      await this.webRevalidator.revalidate({
        paths: buildArticlePublicPaths(slugs, { includeListing: true }),
      });
    } else if (article.status === ArticleStatus.PUBLISHED) {
      await this.webRevalidator.revalidate({
        paths: buildArticlePublicPaths([article.slug], { includeListing: true }),
      });
    }

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
      categoryId: article.categoryId,
      clusterId: article.clusterId,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}
