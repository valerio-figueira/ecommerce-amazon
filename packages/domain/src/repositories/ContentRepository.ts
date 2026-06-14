import type { ContentArticle, CuratedCollection } from '../entities/ContentArticle.js';

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
};

export interface ContentRepository {
  findArticleBySlug(slug: string): Promise<ContentArticle | null>;
  findArticleById(id: string): Promise<ContentArticle | null>;
  listPublishedSummaries(): Promise<ArticleSummary[]>;
  findCollectionBySlug(slug: string): Promise<CuratedCollection | null>;
}
