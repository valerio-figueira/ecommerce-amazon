import { and, asc, desc, eq, gte, inArray, isNotNull, lt, ne, sql } from 'drizzle-orm';

import { Marketplace, PRICE_STALE_HOURS, ProductSortField, type ProductListFilters, type ProductRepository, type SimilarProductsCriteria } from '@ecommerce-amazon/domain';

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
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      conditions.push(inArray(schema.products.categoryId, filters.categoryIds));
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
    if (filters.visibleOnly) {
      conditions.push(eq(schema.products.visible, true));
    }
    if (filters.freshPriceOnly) {
      const staleThreshold = new Date(Date.now() - PRICE_STALE_HOURS * 60 * 60 * 1000);
      conditions.push(eq(schema.products.stalePrice, false));
      conditions.push(gte(schema.products.priceUpdatedAt, staleThreshold));
    }

    const discountPercentSql = sql`(((${schema.products.priceStrikethrough})::numeric - (${schema.products.priceAmount})::numeric) / (${schema.products.priceStrikethrough})::numeric * 100)`;

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
        case ProductSortField.DISCOUNT_PERCENT_DESC:
          return desc(discountPercentSql);
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

  async findSimilarPublishedByCategory(criteria: SimilarProductsCriteria) {
    const limit = criteria.limit ?? 12;
    const rows = await this.db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.categoryId, criteria.categoryId),
          eq(schema.products.visible, true),
          ne(schema.products.id, criteria.excludeProductId),
        ),
      )
      .orderBy(asc(schema.products.priceAmount))
      .limit(limit);

    return rows.map(mapProductRowToDomain);
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
}
