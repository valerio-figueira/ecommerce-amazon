import { asc, and, count, eq, ne } from 'drizzle-orm';

import {
  ArticleCategory,
  type ArticleCategoryRepository,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function mapArticleCategory(row: typeof schema.articleCategories.$inferSelect): ArticleCategory {
  return ArticleCategory.create({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleArticleCategoryRepository implements ArticleCategoryRepository {
  constructor(private readonly db: DrizzleClient) {}

  async listAll(): Promise<ArticleCategory[]> {
    const rows = await this.db
      .select()
      .from(schema.articleCategories)
      .orderBy(asc(schema.articleCategories.name));

    return rows.map(mapArticleCategory);
  }

  async findById(id: string): Promise<ArticleCategory | null> {
    const rows = await this.db
      .select()
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.id, id))
      .limit(1);

    const row = rows[0];
    return row ? mapArticleCategory(row) : null;
  }

  async findBySlug(slug: string): Promise<ArticleCategory | null> {
    const rows = await this.db
      .select()
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? mapArticleCategory(row) : null;
  }

  async save(category: ArticleCategory): Promise<void> {
    await this.db
      .insert(schema.articleCategories)
      .values({
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.articleCategories.id,
        set: {
          name: category.name,
          slug: category.slug,
          updatedAt: category.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.articleCategories).where(eq(schema.articleCategories.id, id));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const condition = excludeId
      ? and(eq(schema.articleCategories.slug, slug), ne(schema.articleCategories.id, excludeId))
      : eq(schema.articleCategories.slug, slug);

    const rows = await this.db
      .select({ count: count() })
      .from(schema.articleCategories)
      .where(condition);

    return Number(rows[0]?.count ?? 0) > 0;
  }

  async countLinkedArticles(id: string): Promise<number> {
    const rows = await this.db
      .select({ count: count() })
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.categoryId, id));

    return Number(rows[0]?.count ?? 0);
  }
}
