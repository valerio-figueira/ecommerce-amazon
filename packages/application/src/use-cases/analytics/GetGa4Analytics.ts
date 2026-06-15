import type {
  AnalyticsRepository,
  CacheStore,
  Ga4AnalyticsGateway,
} from '@ecommerce-amazon/domain';

import { resolveAnalyticsDateRange } from './GetClickAnalytics.js';

const GA4_CACHE_TTL_SECONDS = 30 * 60;

export class GetGa4TrafficAcquisition {
  constructor(
    private readonly ga4Gateway: Ga4AnalyticsGateway,
    private readonly cache: CacheStore,
  ) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    if (!this.ga4Gateway.isConfigured()) {
      return { configured: false as const, from: null, to: null, totalPageViews: 0, items: [] };
    }

    const { from, to } = resolveAnalyticsDateRange(input);
    const cacheKey = `ga4:traffic:${from.toISOString()}:${to.toISOString()}`;
    const cached = await this.cache.get(cacheKey);
    if (cached && typeof cached === 'object' && cached !== null && 'totalPageViews' in cached) {
      return {
        configured: true as const,
        from: from.toISOString(),
        to: to.toISOString(),
        ...(cached as { totalPageViews: number; items: { channel: string; pageViews: number; sharePercent: number }[] }),
      };
    }

    const report = await this.ga4Gateway.getTrafficAcquisition(from, to);
    if (!report) {
      return {
        configured: true as const,
        from: from.toISOString(),
        to: to.toISOString(),
        totalPageViews: 0,
        items: [],
      };
    }

    const payload = {
      totalPageViews: report.totalPageViews,
      items: report.acquisition,
    };
    await this.cache.set(cacheKey, payload, GA4_CACHE_TTL_SECONDS);

    return {
      configured: true as const,
      from: from.toISOString(),
      to: to.toISOString(),
      ...payload,
    };
  }
}

export class GetCtrByOrigin {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly ga4Gateway: Ga4AnalyticsGateway,
    private readonly cache: CacheStore,
  ) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const originClicks = await this.analyticsRepository.getClicksByOrigin(from, to);

    if (!this.ga4Gateway.isConfigured()) {
      return {
        configured: false as const,
        from: from.toISOString(),
        to: to.toISOString(),
        items: originClicks.map((row) => ({
          origin: row.origin,
          clicks: row.count,
          views: 0,
          ctrPercent: null,
        })),
      };
    }

    const cacheKey = `ga4:ctr:${from.toISOString()}:${to.toISOString()}`;
    let ga4ViewsByOrigin: Record<string, number> = {};
    const cached = await this.cache.get(cacheKey);
    if (cached && typeof cached === 'object' && cached !== null) {
      ga4ViewsByOrigin = cached as Record<string, number>;
    } else {
      ga4ViewsByOrigin = await this.ga4Gateway.getEventCountsByParam(
        'affiliate_click',
        'click_origin',
        from,
        to,
      );
      await this.cache.set(cacheKey, ga4ViewsByOrigin, GA4_CACHE_TTL_SECONDS);
    }

    const items = originClicks.map((row) => {
      const views = ga4ViewsByOrigin[row.origin] ?? 0;
      const ctrPercent = views > 0 ? Math.round((row.count / views) * 1000) / 10 : null;
      return {
        origin: row.origin,
        clicks: row.count,
        views,
        ctrPercent,
      };
    });

    return {
      configured: true as const,
      from: from.toISOString(),
      to: to.toISOString(),
      items,
    };
  }
}
