import { and, count, desc, eq, gte, lt, lte, ne, or, sql } from 'drizzle-orm';

import {
  ClickOrigin,
  type AnalyticsRepository,
  type CatalogHealthMetrics,
  type ClickTrendPoint,
  type ConvertingArticle,
  type MarketplaceClickBreakdown,
  type OriginClickBreakdown,
  type TopClickedProduct,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

const STALE_PRICE_MS = 24 * 60 * 60 * 1000;

function clickDateFilter(from: Date, to: Date) {
  return and(
    gte(schema.clickEvents.occurredAt, from),
    lte(schema.clickEvents.occurredAt, to),
    ne(schema.clickEvents.origin, ClickOrigin.REDIRECT_GO),
  );
}

function toSharePercent(countValue: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((countValue / total) * 1000) / 10;
}

export class DrizzleAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: DrizzleClient) {}

  async countTotalClicks(from: Date, to: Date): Promise<number> {
    const rows = await this.db
      .select({ total: count() })
      .from(schema.clickEvents)
      .where(clickDateFilter(from, to));
    return Number(rows[0]?.total ?? 0);
  }

  async getClicksTrend(from: Date, to: Date): Promise<ClickTrendPoint[]> {
    const rows = await this.db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${schema.clickEvents.occurredAt}), 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(schema.clickEvents)
      .where(clickDateFilter(from, to))
      .groupBy(sql`date_trunc('day', ${schema.clickEvents.occurredAt})`)
      .orderBy(sql`date_trunc('day', ${schema.clickEvents.occurredAt})`);

    return rows.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }

  async getClicksByOrigin(from: Date, to: Date): Promise<OriginClickBreakdown[]> {
    const total = await this.countTotalClicks(from, to);
    const rows = await this.db
      .select({
        origin: schema.clickEvents.origin,
        count: count(),
      })
      .from(schema.clickEvents)
      .where(clickDateFilter(from, to))
      .groupBy(schema.clickEvents.origin)
      .orderBy(desc(count()));

    return rows.map((row) => ({
      origin: row.origin,
      count: Number(row.count),
      sharePercent: toSharePercent(Number(row.count), total),
    }));
  }

  async getClicksByMarketplace(from: Date, to: Date): Promise<MarketplaceClickBreakdown[]> {
    const total = await this.countTotalClicks(from, to);
    const rows = await this.db
      .select({
        marketplace: schema.products.marketplace,
        count: count(),
      })
      .from(schema.clickEvents)
      .innerJoin(schema.products, eq(schema.clickEvents.productId, schema.products.id))
      .where(clickDateFilter(from, to))
      .groupBy(schema.products.marketplace)
      .orderBy(desc(count()));

    return rows.map((row) => ({
      marketplace: row.marketplace,
      count: Number(row.count),
      sharePercent: toSharePercent(Number(row.count), total),
    }));
  }

  async getTopClickedProducts(
    from: Date,
    to: Date,
    limit: number,
  ): Promise<TopClickedProduct[]> {
    const rows = await this.db
      .select({
        productId: schema.products.id,
        slug: schema.products.slug,
        title: schema.products.titleClean,
        marketplace: schema.products.marketplace,
        clickCount: count(),
      })
      .from(schema.clickEvents)
      .innerJoin(schema.products, eq(schema.clickEvents.productId, schema.products.id))
      .where(clickDateFilter(from, to))
      .groupBy(
        schema.products.id,
        schema.products.slug,
        schema.products.titleClean,
        schema.products.marketplace,
      )
      .orderBy(desc(count()))
      .limit(limit);

    return rows.map((row) => ({
      productId: row.productId,
      slug: row.slug,
      title: row.title,
      marketplace: row.marketplace,
      clickCount: Number(row.clickCount),
    }));
  }

  async getConvertingArticles(from: Date, to: Date, limit: number): Promise<ConvertingArticle[]> {
    const rows = await this.db
      .select({
        articleId: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        clickCount: count(),
      })
      .from(schema.clickEvents)
      .innerJoin(
        schema.contentArticles,
        eq(schema.clickEvents.articleId, schema.contentArticles.id),
      )
      .where(
        and(
          clickDateFilter(from, to),
          eq(schema.clickEvents.origin, ClickOrigin.EMBED),
        ),
      )
      .groupBy(
        schema.contentArticles.id,
        schema.contentArticles.slug,
        schema.contentArticles.title,
      )
      .orderBy(desc(count()))
      .limit(limit);

    return rows.map((row) => ({
      articleId: row.articleId,
      slug: row.slug,
      title: row.title,
      clickCount: Number(row.clickCount),
    }));
  }

  async getCatalogHealthMetrics(): Promise<CatalogHealthMetrics> {
    const staleThreshold = new Date(Date.now() - STALE_PRICE_MS);
    const visibleFilter = eq(schema.products.visible, true);

    const [totalRow] = await this.db
      .select({ total: count() })
      .from(schema.products)
      .where(visibleFilter);

    const [staleRow] = await this.db
      .select({ stale: count() })
      .from(schema.products)
      .where(
        and(
          visibleFilter,
          or(
            eq(schema.products.stalePrice, true),
            lt(schema.products.priceUpdatedAt, staleThreshold),
          ),
        ),
      );

    const [oosRow] = await this.db
      .select({ oos: count() })
      .from(schema.products)
      .where(
        and(visibleFilter, eq(schema.products.availability, 'out_of_stock')),
      );

    const totalVisibleProducts = Number(totalRow?.total ?? 0);
    const staleCount = Number(staleRow?.stale ?? 0);
    const outOfStockCount = Number(oosRow?.oos ?? 0);

    return {
      totalVisibleProducts,
      staleCount,
      staleRatePercent: toSharePercent(staleCount, totalVisibleProducts),
      outOfStockCount,
    };
  }
}
