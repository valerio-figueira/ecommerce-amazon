import type { AnalyticsRepository } from '@ecommerce-amazon/domain';

export function resolveAnalyticsDateRange(input?: {
  from?: string | undefined;
  to?: string | undefined;
}): { from: Date; to: Date } {
  const to = input?.to ? new Date(input.to) : new Date();
  const from = input?.from
    ? new Date(input.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error('Invalid date range');
  }

  return { from, to };
}

export class GetClickAnalyticsOverview {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const [totalClicks, clicksTrend, catalogHealth, pendingEventCount] = await Promise.all([
      this.analyticsRepository.countTotalClicks(from, to),
      this.analyticsRepository.getClicksTrend(from, to),
      this.analyticsRepository.getCatalogHealthMetrics(),
      this.analyticsRepository.getPendingEventCount(from, to),
    ]);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totalClicks,
      clicksTrend,
      catalogHealth,
      pendingEventCount,
    };
  }
}

export class GetClicksByOrigin {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const [items, pendingEventCount] = await Promise.all([
      this.analyticsRepository.getClicksByOrigin(from, to),
      this.analyticsRepository.getPendingEventCount(from, to),
    ]);
    return { from: from.toISOString(), to: to.toISOString(), items, pendingEventCount };
  }
}

export class GetClicksByMarketplace {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const [clickItems, catalogItems] = await Promise.all([
      this.analyticsRepository.getClicksByMarketplace(from, to),
      this.analyticsRepository.getVisibleProductCountByMarketplace(),
    ]);

    const clickByMarketplace = new Map(clickItems.map((item) => [item.marketplace, item]));
    const catalogByMarketplace = new Map(catalogItems.map((item) => [item.marketplace, item]));
    const allMarketplaces = new Set([
      ...clickItems.map((item) => item.marketplace),
      ...catalogItems.map((item) => item.marketplace),
    ]);

    const items = [...allMarketplaces]
      .map((marketplace) => {
        const click = clickByMarketplace.get(marketplace);
        const catalog = catalogByMarketplace.get(marketplace);
        const catalogSharePercent = catalog?.sharePercent ?? 0;
        const clickSharePercent = click?.sharePercent ?? 0;
        const clickIndex =
          catalogSharePercent > 0
            ? Math.round((clickSharePercent / catalogSharePercent) * 100) / 100
            : null;

        return {
          marketplace,
          count: click?.count ?? 0,
          sharePercent: clickSharePercent,
          catalogCount: catalog?.count ?? 0,
          catalogSharePercent,
          clickIndex,
        };
      })
      .sort((left, right) => right.count - left.count);

    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetTopClickedProducts {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: {
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
  }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const limit = input?.limit ?? 10;
    const items = await this.analyticsRepository.getTopClickedProducts(from, to, limit);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetConvertingArticles {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: {
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
  }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const limit = input?.limit ?? 10;
    const items = await this.analyticsRepository.getConvertingArticles(from, to, limit);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetCatalogHealthMetrics {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute() {
    return this.analyticsRepository.getCatalogHealthMetrics();
  }
}
