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
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export type PublishedArticleListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
};

export type ListPublishedArticlesOptions = {
  categorySlug?: string;
  search?: string;
  page: number;
  limit: number;
};

export type PublishedArticleCategoryOption = {
  name: string;
  slug: string;
};

export type ListAdminArticlesOptions = {
  status?: ArticleStatus;
  search?: string;
  page: number;
  pageSize: number;
};

export interface ContentRepository {
  findArticleBySlug(slug: string): Promise<ContentArticle | null>;
  findArticleById(id: string): Promise<ContentArticle | null>;
  listPublishedSummaries(): Promise<ArticleSummary[]>;
  listAdminArticles(
    options: ListAdminArticlesOptions,
  ): Promise<{ items: AdminArticleSummary[]; total: number }>;
  findRelatedPublishedByCategory(
    categoryId: string,
    excludeArticleId: string,
    limit: number,
  ): Promise<ArticlePublicSummary[]>;
  listPublishedByCategorySlug(categorySlug: string): Promise<ArticlePublicSummary[]>;
  listPublishedArticles(
    options: ListPublishedArticlesOptions,
  ): Promise<{ items: PublishedArticleListItem[]; total: number }>;
  listPublishedArticleCategories(): Promise<PublishedArticleCategoryOption[]>;
  saveArticle(article: ContentArticle): Promise<void>;
  deleteArticle(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  findCollectionBySlug(slug: string): Promise<CuratedCollection | null>;
}
