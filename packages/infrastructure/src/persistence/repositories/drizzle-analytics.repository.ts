import { and, count, desc, eq, gte, isNotNull, lt, lte, ne, or, sql } from 'drizzle-orm';

import {
  ClickOrigin,
  type AnalyticsRepository,
  type BlockClickBreakdown,
  type CatalogHealthMetrics,
  type ClickTrendPoint,
  type ConvertingArticle,
  type EngagementAnalyticsRepository,
  type EditorialFunnelMetrics,
  type EditorialFunnelArticleStage,
  type MarketplaceClickBreakdown,
  type OriginClickBreakdown,
  type OriginTrendPoint,
  type PagePathClickBreakdown,
  type PlacementClickBreakdown,
  type TopClickedProduct,
} from '@ecommerce-amazon/domain';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';

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

function engagementDateFilter(from: Date, to: Date) {
  return and(
    gte(schema.contentEngagementEvents.occurredAt, from),
    lte(schema.contentEngagementEvents.occurredAt, to),
  );
}

function toRatePercent(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export class DrizzleAnalyticsRepository implements AnalyticsRepository, EngagementAnalyticsRepository {
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

  async getClicksByPlacement(from: Date, to: Date): Promise<PlacementClickBreakdown[]> {
    const total = await this.countTotalClicks(from, to);
    const rows = await this.db
      .select({
        placement: schema.clickEvents.placement,
        count: count(),
      })
      .from(schema.clickEvents)
      .where(and(clickDateFilter(from, to), isNotNull(schema.clickEvents.placement)))
      .groupBy(schema.clickEvents.placement)
      .orderBy(desc(count()));

    return rows
      .filter((row): row is typeof row & { placement: string } => row.placement !== null)
      .map((row) => ({
        placement: row.placement,
        count: Number(row.count),
        sharePercent: toSharePercent(Number(row.count), total),
      }));
  }

  async getClicksByBlock(from: Date, to: Date): Promise<BlockClickBreakdown[]> {
    const rows = await this.db
      .select({
        blockId: schema.pageBlocks.id,
        blockType: schema.pageBlocks.type,
        pageSlug: schema.pages.slug,
        count: count(),
      })
      .from(schema.clickEvents)
      .innerJoin(schema.pageBlocks, eq(schema.clickEvents.blockId, schema.pageBlocks.id))
      .innerJoin(schema.pages, eq(schema.pageBlocks.pageId, schema.pages.id))
      .where(and(clickDateFilter(from, to), isNotNull(schema.clickEvents.blockId)))
      .groupBy(schema.pageBlocks.id, schema.pageBlocks.type, schema.pages.slug)
      .orderBy(desc(count()))
      .limit(20);

    return rows.map((row) => ({
      blockId: row.blockId,
      blockType: row.blockType,
      pageSlug: row.pageSlug,
      count: Number(row.count),
    }));
  }

  async getClicksByPage(
    from: Date,
    to: Date,
    limit: number,
  ): Promise<PagePathClickBreakdown[]> {
    const rows = await this.db
      .select({
        pagePath: schema.clickEvents.pagePath,
        count: count(),
      })
      .from(schema.clickEvents)
      .where(and(clickDateFilter(from, to), isNotNull(schema.clickEvents.pagePath)))
      .groupBy(schema.clickEvents.pagePath)
      .orderBy(desc(count()))
      .limit(limit);

    return rows
      .filter((row): row is typeof row & { pagePath: string } => row.pagePath !== null)
      .map((row) => ({
        pagePath: row.pagePath,
        count: Number(row.count),
      }));
  }

  async getClicksTrendByOrigin(from: Date, to: Date): Promise<OriginTrendPoint[]> {
    const rows = await this.db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${schema.clickEvents.occurredAt}), 'YYYY-MM-DD')`,
        origin: schema.clickEvents.origin,
        count: count(),
      })
      .from(schema.clickEvents)
      .where(clickDateFilter(from, to))
      .groupBy(
        sql`date_trunc('day', ${schema.clickEvents.occurredAt})`,
        schema.clickEvents.origin,
      )
      .orderBy(
        sql`date_trunc('day', ${schema.clickEvents.occurredAt})`,
        schema.clickEvents.origin,
      );

    return rows.map((row) => ({
      date: row.date,
      origin: row.origin,
      count: Number(row.count),
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
        embedClickCount: sql<number>`count(*) filter (where ${schema.clickEvents.origin} = ${ClickOrigin.EMBED})`,
        comparadorClickCount: sql<number>`count(*) filter (where ${schema.clickEvents.origin} = ${ClickOrigin.COMPARISON})`,
      })
      .from(schema.clickEvents)
      .innerJoin(
        schema.contentArticles,
        eq(schema.clickEvents.articleId, schema.contentArticles.id),
      )
      .where(
        and(
          clickDateFilter(from, to),
          isNotNull(schema.clickEvents.articleId),
          or(
            eq(schema.clickEvents.origin, ClickOrigin.EMBED),
            eq(schema.clickEvents.origin, ClickOrigin.COMPARISON),
          ),
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
      embedClickCount: Number(row.embedClickCount),
      comparadorClickCount: Number(row.comparadorClickCount),
    }));
  }

  async getEditorialFunnel(from: Date, to: Date): Promise<EditorialFunnelMetrics> {
    const [cardClicksRow] = await this.db
      .select({ total: count() })
      .from(schema.contentEngagementEvents)
      .where(
        and(
          engagementDateFilter(from, to),
          eq(schema.contentEngagementEvents.eventType, EngagementEventType.ARTICLE_CARD_CLICK),
        ),
      );

    const [pageViewsRow] = await this.db
      .select({ total: count() })
      .from(schema.contentEngagementEvents)
      .where(
        and(
          engagementDateFilter(from, to),
          eq(schema.contentEngagementEvents.eventType, EngagementEventType.ARTICLE_PAGE_VIEW),
        ),
      );

    const [affiliateClicksRow] = await this.db
      .select({ total: count() })
      .from(schema.clickEvents)
      .where(
        and(
          clickDateFilter(from, to),
          isNotNull(schema.clickEvents.articleId),
          or(
            eq(schema.clickEvents.origin, ClickOrigin.EMBED),
            eq(schema.clickEvents.origin, ClickOrigin.COMPARISON),
          ),
        ),
      );

    const articleCardClicks = Number(cardClicksRow?.total ?? 0);
    const articlePageViews = Number(pageViewsRow?.total ?? 0);
    const embedAffiliateClicks = Number(affiliateClicksRow?.total ?? 0);

    const [topCardClicks, topPageViews, topAffiliateClicks] = await Promise.all([
      this.getTopArticlesByEngagementEvent(
        from,
        to,
        EngagementEventType.ARTICLE_CARD_CLICK,
      ),
      this.getTopArticlesByEngagementEvent(
        from,
        to,
        EngagementEventType.ARTICLE_PAGE_VIEW,
      ),
      this.getTopArticlesByAffiliateClicks(from, to),
    ]);

    return {
      articleCardClicks,
      articlePageViews,
      embedAffiliateClicks,
      cardToViewRatePercent: toRatePercent(articlePageViews, articleCardClicks),
      viewToClickRatePercent: toRatePercent(embedAffiliateClicks, articlePageViews),
      topArticlesByCardClicks: topCardClicks,
      topArticlesByPageViews: topPageViews,
      topArticlesByAffiliateClicks: topAffiliateClicks,
    };
  }

  private async getTopArticlesByEngagementEvent(
    from: Date,
    to: Date,
    eventType: string,
    limit = 5,
  ): Promise<EditorialFunnelArticleStage[]> {
    const rows = await this.db
      .select({
        articleId: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        count: count(),
      })
      .from(schema.contentEngagementEvents)
      .innerJoin(
        schema.contentArticles,
        eq(schema.contentEngagementEvents.articleId, schema.contentArticles.id),
      )
      .where(and(engagementDateFilter(from, to), eq(schema.contentEngagementEvents.eventType, eventType)))
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
      count: Number(row.count),
    }));
  }

  private async getTopArticlesByAffiliateClicks(
    from: Date,
    to: Date,
    limit = 5,
  ): Promise<EditorialFunnelArticleStage[]> {
    const rows = await this.db
      .select({
        articleId: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        count: count(),
      })
      .from(schema.clickEvents)
      .innerJoin(
        schema.contentArticles,
        eq(schema.clickEvents.articleId, schema.contentArticles.id),
      )
      .where(
        and(
          clickDateFilter(from, to),
          or(
            eq(schema.clickEvents.origin, ClickOrigin.EMBED),
            eq(schema.clickEvents.origin, ClickOrigin.COMPARISON),
          ),
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
      count: Number(row.count),
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
