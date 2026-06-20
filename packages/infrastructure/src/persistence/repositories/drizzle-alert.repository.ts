import { and, desc, eq, gte } from 'drizzle-orm';

import {
  AlertStatus,
  Marketplace,
  type PriceAlertRepository,
  type PriceSnapshotRepository,
  type WishlistRepository,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';
import { mapPriceAlertRow, mapPriceAlertToRow } from '../mappers/product.mapper.js';

export class DrizzlePriceAlertRepository implements PriceAlertRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(schema.priceAlerts)
      .where(eq(schema.priceAlerts.id, id));
    const row = rows[0];
    return row ? mapPriceAlertRow(row) : null;
  }

  async findByConfirmToken(token: string) {
    const rows = await this.db
      .select()
      .from(schema.priceAlerts)
      .where(eq(schema.priceAlerts.confirmToken, token));
    const row = rows[0];
    return row ? mapPriceAlertRow(row) : null;
  }

  async findActiveByProductId(productId: string) {
    const rows = await this.db
      .select()
      .from(schema.priceAlerts)
      .where(
        and(
          eq(schema.priceAlerts.productId, productId),
          eq(schema.priceAlerts.status, AlertStatus.ACTIVE),
        ),
      );
    return rows.map(mapPriceAlertRow);
  }

  async findActiveForProduct(productId: string) {
    return this.findActiveByProductId(productId);
  }

  async countActiveByEmail(email: string) {
    const rows = await this.db
      .select()
      .from(schema.priceAlerts)
      .where(
        and(eq(schema.priceAlerts.email, email), eq(schema.priceAlerts.status, AlertStatus.ACTIVE)),
      );
    return rows.length;
  }

  async save(alert: import('@ecommerce-amazon/domain').PriceAlert) {
    await this.db
      .insert(schema.priceAlerts)
      .values(mapPriceAlertToRow(alert))
      .onConflictDoUpdate({
        target: schema.priceAlerts.id,
        set: mapPriceAlertToRow(alert),
      });
  }

  async updateStatus(id: string, status: AlertStatus, triggeredAt?: Date) {
    await this.db
      .update(schema.priceAlerts)
      .set({ status, triggeredAt })
      .where(eq(schema.priceAlerts.id, id));
  }
}

export class DrizzlePriceSnapshotRepository implements PriceSnapshotRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByProductId(productId: string, days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.db
      .select()
      .from(schema.priceSnapshots)
      .where(
        and(
          eq(schema.priceSnapshots.productId, productId),
          gte(schema.priceSnapshots.capturedAt, since),
        ),
      )
      .orderBy(desc(schema.priceSnapshots.capturedAt));

    const { mapSnapshotRow } = await import('../mappers/product.mapper.js');
    return rows.map(mapSnapshotRow);
  }

  async insertBatch(snapshots: import('@ecommerce-amazon/domain').PriceSnapshot[]) {
    if (snapshots.length === 0) return;
    await this.db.insert(schema.priceSnapshots).values(
      snapshots.map((s) => ({
        id: s.id,
        productId: s.productId,
        amount: String(s.price.amount),
        currency: s.price.currency,
        source: s.source,
        capturedAt: s.capturedAt,
      })),
    );
  }
}

export class DrizzleWishlistRepository implements WishlistRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findBySessionId(sessionId: string) {
    const rows = await this.db
      .select()
      .from(schema.wishlistItems)
      .where(eq(schema.wishlistItems.sessionId, sessionId));
    const { mapWishlistRow } = await import('../mappers/product.mapper.js');
    return rows.map(mapWishlistRow);
  }

  async add(item: import('@ecommerce-amazon/domain').WishlistItem) {
    await this.db.insert(schema.wishlistItems).values({
      id: item.id,
      sessionId: item.sessionId,
      productId: item.productId,
      marketplace: item.marketplace,
      sortOrder: item.sortOrder,
      addedAt: item.addedAt,
    });
  }

  async remove(id: string, sessionId: string) {
    await this.db
      .delete(schema.wishlistItems)
      .where(and(eq(schema.wishlistItems.id, id), eq(schema.wishlistItems.sessionId, sessionId)));
  }

  async removeAllBySessionId(sessionId: string) {
    await this.db.delete(schema.wishlistItems).where(eq(schema.wishlistItems.sessionId, sessionId));
  }

  async countBySessionAndMarketplace(sessionId: string, marketplace: Marketplace) {
    const rows = await this.db
      .select()
      .from(schema.wishlistItems)
      .where(
        and(
          eq(schema.wishlistItems.sessionId, sessionId),
          eq(schema.wishlistItems.marketplace, marketplace),
        ),
      );
    return rows.length;
  }
}
