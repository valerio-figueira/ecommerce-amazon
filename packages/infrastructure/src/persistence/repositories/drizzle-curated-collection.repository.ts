import { asc, and, count, eq, ne, sql } from 'drizzle-orm';

import type {
  CuratedCollection,
  CuratedCollectionRepository,
  CuratedCollectionSummary,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import { mapCollection, mapCollectionToRow } from '../mappers/product.mapper.js';

export class DrizzleCuratedCollectionRepository implements CuratedCollectionRepository {
  constructor(private readonly db: DrizzleClient) {}

  async listAll(): Promise<CuratedCollectionSummary[]> {
    const rows = await this.db
      .select({
        id: schema.curatedCollections.id,
        slug: schema.curatedCollections.slug,
        title: schema.curatedCollections.title,
        coverImageUrl: schema.curatedCollections.coverImageUrl,
        updatedAt: schema.curatedCollections.updatedAt,
        productCount: sql<number>`count(${schema.collectionProducts.id})::int`,
      })
      .from(schema.curatedCollections)
      .leftJoin(
        schema.collectionProducts,
        eq(schema.collectionProducts.collectionId, schema.curatedCollections.id),
      )
      .groupBy(
        schema.curatedCollections.id,
        schema.curatedCollections.slug,
        schema.curatedCollections.title,
        schema.curatedCollections.coverImageUrl,
        schema.curatedCollections.updatedAt,
      )
      .orderBy(asc(schema.curatedCollections.title));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      coverImageUrl: row.coverImageUrl,
      productCount: row.productCount,
      updatedAt: row.updatedAt,
    }));
  }

  async findById(id: string): Promise<CuratedCollection | null> {
    const rows = await this.db
      .select()
      .from(schema.curatedCollections)
      .where(eq(schema.curatedCollections.id, id));
    const row = rows[0];
    if (!row) return null;
    return this.loadWithProducts(row);
  }

  async findBySlug(slug: string): Promise<CuratedCollection | null> {
    const rows = await this.db
      .select()
      .from(schema.curatedCollections)
      .where(eq(schema.curatedCollections.slug, slug));
    const row = rows[0];
    if (!row) return null;
    return this.loadWithProducts(row);
  }

  async save(collection: CuratedCollection): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .insert(schema.curatedCollections)
        .values(mapCollectionToRow(collection))
        .onConflictDoUpdate({
          target: schema.curatedCollections.id,
          set: mapCollectionToRow(collection),
        });

      await tx
        .delete(schema.collectionProducts)
        .where(eq(schema.collectionProducts.collectionId, collection.id));

      for (let i = 0; i < collection.productIds.length; i++) {
        const productId = collection.productIds[i];
        if (!productId) continue;
        await tx.insert(schema.collectionProducts).values({
          collectionId: collection.id,
          productId,
          sortOrder: i,
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.curatedCollections).where(eq(schema.curatedCollections.id, id));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const condition = excludeId
      ? and(eq(schema.curatedCollections.slug, slug), ne(schema.curatedCollections.id, excludeId))
      : eq(schema.curatedCollections.slug, slug);

    const rows = await this.db
      .select({ count: count() })
      .from(schema.curatedCollections)
      .where(condition);

    return (rows[0]?.count ?? 0) > 0;
  }

  private async loadWithProducts(
    row: typeof schema.curatedCollections.$inferSelect,
  ): Promise<CuratedCollection> {
    const products = await this.db
      .select()
      .from(schema.collectionProducts)
      .where(eq(schema.collectionProducts.collectionId, row.id));

    return mapCollection(
      row,
      products.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.productId),
    );
  }
}
