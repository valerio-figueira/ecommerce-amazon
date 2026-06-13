import type { ContentArticle, CuratedCollection } from '../entities/ContentArticle.js';

export interface ContentRepository {
  findArticleBySlug(slug: string): Promise<ContentArticle | null>;
  findCollectionBySlug(slug: string): Promise<CuratedCollection | null>;
}
