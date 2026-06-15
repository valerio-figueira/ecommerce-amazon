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
    const [totalClicks, clicksTrend, catalogHealth] = await Promise.all([
      this.analyticsRepository.countTotalClicks(from, to),
      this.analyticsRepository.getClicksTrend(from, to),
      this.analyticsRepository.getCatalogHealthMetrics(),
    ]);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totalClicks,
      clicksTrend,
      catalogHealth,
    };
  }
}

export class GetClicksByOrigin {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByOrigin(from, to);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetClicksByMarketplace {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByMarketplace(from, to);
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
