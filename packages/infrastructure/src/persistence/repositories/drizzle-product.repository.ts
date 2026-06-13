import { and, asc, desc, eq, gte, inArray, isNotNull, lt, sql } from 'drizzle-orm';

import { Marketplace, PRICE_STALE_HOURS, ProductSortField, type ProductListFilters, type ProductRepository } from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import { mapProductRowToDomain, mapProductToRow } from '../mappers/product.mapper.js';

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: string) {
    const rows = await this.db.select().from(schema.products).where(eq(schema.products.id, id));
    const row = rows[0];
    return row ? mapProductRowToDomain(row) : null;
  }

  async findBySlug(slug: string) {
    const rows = await this.db.select().from(schema.products).where(eq(schema.products.slug, slug));
    const row = rows[0];
    return row ? mapProductRowToDomain(row) : null;
  }

  async findByExternalId(marketplace: Marketplace, externalId: string) {
    const rows = await this.db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.marketplace, marketplace),
          eq(schema.products.externalId, externalId),
        ),
      );
    const row = rows[0];
    return row ? mapProductRowToDomain(row) : null;
  }

  async findPublished(filters: ProductListFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (filters.category) {
      conditions.push(eq(schema.products.categoryVertical, filters.category));
    }
    if (filters.marketplace) {
      conditions.push(eq(schema.products.marketplace, filters.marketplace));
    }
    if (filters.minDiscountPercentage !== undefined) {
      conditions.push(isNotNull(schema.products.priceStrikethrough));
      conditions.push(
        gte(
          sql`(((${schema.products.priceStrikethrough})::numeric - (${schema.products.priceAmount})::numeric) / (${schema.products.priceStrikethrough})::numeric * 100)`,
          filters.minDiscountPercentage,
        ),
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const sortField = filters.sort ?? ProductSortField.EDITORIAL_SCORE;
    const orderByClause = (() => {
      switch (sortField) {
        case ProductSortField.PRICE_UPDATED_AT:
          return desc(schema.products.priceUpdatedAt);
        case ProductSortField.CREATED_AT:
          return desc(schema.products.createdAt);
        case ProductSortField.PRICE_ASC:
          return asc(schema.products.priceAmount);
        case ProductSortField.PRICE_DESC:
          return desc(schema.products.priceAmount);
        case ProductSortField.EDITORIAL_SCORE:
        default:
          return desc(schema.products.editorialScore);
      }
    })();

    const [items, countResult] = await Promise.all([
      this.db
        .select()
        .from(schema.products)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(orderByClause),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.products)
        .where(where),
    ]);

    return {
      items: items.map(mapProductRowToDomain),
      total: countResult[0]?.count ?? 0,
    };
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const rows = await this.db
      .select()
      .from(schema.products)
      .where(inArray(schema.products.id, ids));
    return rows.map(mapProductRowToDomain);
  }

  async findDueForPriceRefresh(criteria: { limit?: number; onlyStale?: boolean }) {
    const limit = criteria.limit ?? 500;
    const staleThreshold = new Date(Date.now() - PRICE_STALE_HOURS * 60 * 60 * 1000);

    const rows = await this.db
      .select()
      .from(schema.products)
      .where(
        criteria.onlyStale
          ? lt(schema.products.priceUpdatedAt, staleThreshold)
          : undefined,
      )
      .limit(limit);

    return rows.map(mapProductRowToDomain);
  }

  async findDueForCatalogSync(criteria: { limit?: number }) {
    const rows = await this.db.select().from(schema.products).limit(criteria.limit ?? 500);
    return rows.map(mapProductRowToDomain);
  }

  async save(product: import('@ecommerce-amazon/domain').Product) {
    await this.db
      .insert(schema.products)
      .values(mapProductToRow(product))
      .onConflictDoUpdate({
        target: schema.products.id,
        set: mapProductToRow(product),
      });
  }

  async saveBatch(products: import('@ecommerce-amazon/domain').Product[]) {
    for (const product of products) {
      await this.save(product);
    }
  }

  async listCategories() {
    const rows = await this.db
      .select({
        slug: schema.products.categoryVertical,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.products)
      .where(isNotNull(schema.products.categoryVertical))
      .groupBy(schema.products.categoryVertical);

    return rows
      .filter((row): row is { slug: string; count: number } => row.slug !== null)
      .map((row) => ({ slug: row.slug, count: row.count }));
  }
}
