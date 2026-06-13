import { and, asc, eq, inArray, isNull, ne, sql } from 'drizzle-orm';

import type { Category, CategoryRepository, CategoryReorderItem } from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import { mapCategoryRowToDomain, mapCategoryToRow } from '../mappers/category.mapper.js';

export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: string): Promise<Category | null> {
    const rows = await this.db.select().from(schema.categories).where(eq(schema.categories.id, id));
    const row = rows[0];
    return row ? mapCategoryRowToDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const rows = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug));
    const row = rows[0];
    return row ? mapCategoryRowToDomain(row) : null;
  }

  async listAll(): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.label));
    return rows.map(mapCategoryRowToDomain);
  }

  async listChildren(parentId: string | null): Promise<Category[]> {
    const condition =
      parentId === null
        ? isNull(schema.categories.parentId)
        : eq(schema.categories.parentId, parentId);

    const rows = await this.db
      .select()
      .from(schema.categories)
      .where(condition)
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.label));

    return rows.map(mapCategoryRowToDomain);
  }

  async getDescendantIds(categoryId: string): Promise<string[]> {
    const result = await this.db.execute<{ id: string }>(sql`
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories WHERE id = ${categoryId}
        UNION ALL
        SELECT c.id FROM categories c
        INNER JOIN descendants d ON c.parent_id = d.id
      )
      SELECT id FROM descendants
    `);

    return result.map((row) => row.id);
  }

  async getAncestorChain(categoryId: string): Promise<Category[]> {
    const chain: Category[] = [];
    let current = await this.findById(categoryId);

    while (current) {
      chain.unshift(current);
      if (!current.parentId) {
        break;
      }
      current = await this.findById(current.parentId);
    }

    return chain;
  }

  async countProductsInIds(categoryIds: string[], visibleOnly = false): Promise<number> {
    if (categoryIds.length === 0) return 0;

    const conditions = [inArray(schema.products.categoryId, categoryIds)];
    if (visibleOnly) {
      conditions.push(eq(schema.products.visible, true));
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.products)
      .where(and(...conditions));

    return result[0]?.count ?? 0;
  }

  async countProductsByCategoryId(visibleOnly = false): Promise<Map<string, number>> {
    const conditions = [];
    if (visibleOnly) {
      conditions.push(eq(schema.products.visible, true));
    }

    const rows = await this.db
      .select({
        categoryId: schema.products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(schema.products.categoryId);

    const counts = new Map<string, number>();
    for (const row of rows) {
      if (row.categoryId) {
        counts.set(row.categoryId, row.count);
      }
    }
    return counts;
  }

  async hasChildren(categoryId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.parentId, categoryId))
      .limit(1);
    return rows.length > 0;
  }

  async countDirectProducts(categoryId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.products)
      .where(eq(schema.products.categoryId, categoryId));
    return result[0]?.count ?? 0;
  }

  async save(category: Category): Promise<void> {
    await this.db
      .insert(schema.categories)
      .values(mapCategoryToRow(category))
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: mapCategoryToRow(category),
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.categories).where(eq(schema.categories.id, id));
  }

  async reorder(items: CategoryReorderItem[]): Promise<void> {
    for (const item of items) {
      await this.db
        .update(schema.categories)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(schema.categories.id, item.id));
    }
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(schema.categories.slug, slug)];
    if (excludeId) {
      conditions.push(ne(schema.categories.id, excludeId));
    }

    const rows = await this.db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  }
}
