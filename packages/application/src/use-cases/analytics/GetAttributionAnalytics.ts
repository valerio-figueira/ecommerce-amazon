import type { AnalyticsRepository, EngagementAnalyticsRepository } from '@ecommerce-amazon/domain';

import { resolveAnalyticsDateRange } from './GetClickAnalytics.js';

async function withPendingEventCount<T extends Record<string, unknown>>(
  analyticsRepository: AnalyticsRepository,
  from: Date,
  to: Date,
  payload: T,
): Promise<T & { pendingEventCount: number }> {
  const pendingEventCount = await analyticsRepository.getPendingEventCount(from, to);
  return { ...payload, pendingEventCount };
}

export class GetClicksByPlacement {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByPlacement(from, to);
    return withPendingEventCount(this.analyticsRepository, from, to, {
      from: from.toISOString(),
      to: to.toISOString(),
      items,
    });
  }
}

export class GetClicksByBlock {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByBlock(from, to);
    return withPendingEventCount(this.analyticsRepository, from, to, {
      from: from.toISOString(),
      to: to.toISOString(),
      items,
    });
  }
}

export class GetClicksByPage {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByPage(from, to, 20);
    return withPendingEventCount(this.analyticsRepository, from, to, {
      from: from.toISOString(),
      to: to.toISOString(),
      items,
    });
  }
}

export class GetClicksTrendByOrigin {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksTrendByOrigin(from, to);
    return withPendingEventCount(this.analyticsRepository, from, to, {
      from: from.toISOString(),
      to: to.toISOString(),
      items,
    });
  }
}

export class GetEditorialFunnel {
  constructor(private readonly engagementAnalyticsRepository: EngagementAnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const [metrics, pendingEventCount] = await Promise.all([
      this.engagementAnalyticsRepository.getEditorialFunnel(from, to),
      this.engagementAnalyticsRepository.getPendingEventCount(from, to),
    ]);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      pendingEventCount,
      ...metrics,
    };
  }
}
