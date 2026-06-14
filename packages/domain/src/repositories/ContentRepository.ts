import type { ContentArticle, CuratedCollection } from '../entities/ContentArticle.js';
import type { ArticleStatus } from '../enums/index.js';

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
};

export type AdminArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ArticleStatus;
  coverImageUrl: string | null;
  updatedAt: Date;
};

export type ArticlePublicSummary = {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export interface ContentRepository {
  findArticleBySlug(slug: string): Promise<ContentArticle | null>;
  findArticleById(id: string): Promise<ContentArticle | null>;
  listPublishedSummaries(): Promise<ArticleSummary[]>;
  listAdminSummaries(status?: ArticleStatus): Promise<AdminArticleSummary[]>;
  findRelatedPublishedByCategory(
    categoryId: string,
    excludeArticleId: string,
    limit: number,
  ): Promise<ArticlePublicSummary[]>;
  saveArticle(article: ContentArticle): Promise<void>;
  deleteArticle(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  findCollectionBySlug(slug: string): Promise<CuratedCollection | null>;
}
