import type { ArticleCategory } from '../entities/ArticleCategory.js';

export interface ArticleCategoryRepository {
  listAll(): Promise<ArticleCategory[]>;
  findById(id: string): Promise<ArticleCategory | null>;
  findBySlug(slug: string): Promise<ArticleCategory | null>;
  save(category: ArticleCategory): Promise<void>;
  delete(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  countLinkedArticles(id: string): Promise<number>;
}
