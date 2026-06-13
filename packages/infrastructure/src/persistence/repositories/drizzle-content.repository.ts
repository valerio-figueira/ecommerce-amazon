import { eq } from 'drizzle-orm';

import {
  CouponStatus,
  type ContentRepository,
  type CouponRepository,
  type ClickEventRepository,
  type ProductComparisonRepository,
  type SyncJobLogRepository,
  Marketplace,
  type SyncJobLog,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import {
  mapArticle,
  mapCollection,
  mapComparison,
  mapCouponRow,
  mapCouponToRow,
} from '../mappers/product.mapper.js';

export class DrizzleContentRepository implements ContentRepository {
  constructor(
    private readonly db: DrizzleClient,
    private readonly collectionRepository?: import('./drizzle-curated-collection.repository.js').DrizzleCuratedCollectionRepository,
  ) {}

  async findArticleBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.slug, slug));
    const row = rows[0];
    if (!row) return null;

    const embeds = await this.db
      .select()
      .from(schema.contentProductEmbeds)
      .where(eq(schema.contentProductEmbeds.articleId, row.id));

    return mapArticle(
      row,
      embeds.map((e) => ({
        productId: e.productId,
        position: e.position,
        variant: e.variant,
      })),
    );
  }

  async findCollectionBySlug(slug: string) {
    if (this.collectionRepository) {
      return this.collectionRepository.findBySlug(slug);
    }

    const rows = await this.db
      .select()
      .from(schema.curatedCollections)
      .where(eq(schema.curatedCollections.slug, slug));
    const row = rows[0];
    if (!row) return null;

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

export class DrizzleCouponRepository implements CouponRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findActiveVerified() {
    const rows = await this.db
      .select()
      .from(schema.coupons)
      .where(eq(schema.coupons.status, CouponStatus.ACTIVE));
    return rows.map(mapCouponRow);
  }

  async findByMarketplace(marketplace: Marketplace) {
    const rows = await this.db
      .select()
      .from(schema.coupons)
      .where(eq(schema.coupons.marketplace, marketplace));
    return rows.map(mapCouponRow);
  }

  async findDueForVerification(limit: number) {
    const rows = await this.db.select().from(schema.coupons).limit(limit);
    return rows.map(mapCouponRow);
  }

  async save(coupon: import('@ecommerce-amazon/domain').Coupon) {
    await this.db
      .insert(schema.coupons)
      .values(mapCouponToRow(coupon))
      .onConflictDoUpdate({
        target: schema.coupons.id,
        set: mapCouponToRow(coupon),
      });
  }

  async saveBatch(coupons: import('@ecommerce-amazon/domain').Coupon[]) {
    for (const coupon of coupons) {
      await this.save(coupon);
    }
  }
}

export class DrizzleProductComparisonRepository implements ProductComparisonRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByShareToken(token: string) {
    const rows = await this.db
      .select()
      .from(schema.productComparisons)
      .where(eq(schema.productComparisons.shareToken, token));
    const row = rows[0];
    if (!row) return null;

    const products = await this.db
      .select()
      .from(schema.comparisonProducts)
      .where(eq(schema.comparisonProducts.comparisonId, row.id));

    return mapComparison(
      row,
      products.sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.productId),
    );
  }

  async save(comparison: import('@ecommerce-amazon/domain').ProductComparison) {
    await this.db.insert(schema.productComparisons).values({
      id: comparison.id,
      shareToken: comparison.shareToken,
      sessionId: comparison.sessionId,
      editorialIntro: comparison.editorialIntro,
      createdAt: comparison.createdAt,
    });

    for (let i = 0; i < comparison.productIds.length; i++) {
      const productId = comparison.productIds[i];
      if (!productId) continue;
      await this.db.insert(schema.comparisonProducts).values({
        comparisonId: comparison.id,
        productId,
        sortOrder: i,
      });
    }
  }
}

export class DrizzleSyncJobLogRepository implements SyncJobLogRepository {
  constructor(private readonly db: DrizzleClient) {}

  async save(log: SyncJobLog): Promise<void> {
    await this.db.insert(schema.syncJobLogs).values({
      id: log.id,
      jobType: log.jobType,
      status: log.status,
      itemsProcessed: log.itemsProcessed,
      errors: log.errors,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
    });
  }
}

export class DrizzleClickEventRepository implements ClickEventRepository {
  constructor(private readonly db: DrizzleClient) {}

  async record(event: {
    productId: string;
    origin: string;
    sessionId?: string;
    blockId?: string;
    occurredAt: Date;
  }) {
    await this.db.insert(schema.clickEvents).values({
      productId: event.productId,
      origin: event.origin,
      sessionId: event.sessionId,
      blockId: event.blockId,
      occurredAt: event.occurredAt,
    });
  }
}
