import type { AnalyticsRepository, EngagementAnalyticsRepository } from '@ecommerce-amazon/domain';

import { resolveAnalyticsDateRange } from './GetClickAnalytics.js';

export class GetClicksByPlacement {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByPlacement(from, to);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetClicksByBlock {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByBlock(from, to);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetClicksByPage {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksByPage(from, to, 20);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetClicksTrendByOrigin {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const items = await this.analyticsRepository.getClicksTrendByOrigin(from, to);
    return { from: from.toISOString(), to: to.toISOString(), items };
  }
}

export class GetEditorialFunnel {
  constructor(private readonly engagementAnalyticsRepository: EngagementAnalyticsRepository) {}

  async execute(input?: { from?: string | undefined; to?: string | undefined }) {
    const { from, to } = resolveAnalyticsDateRange(input);
    const metrics = await this.engagementAnalyticsRepository.getEditorialFunnel(from, to);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      ...metrics,
    };
  }
}
