import type {
  AnalyticsRepository,
  EngagementAnalyticsRepository,
  TelemetryBufferStore,
} from '@ecommerce-amazon/domain';

import { DrizzleAnalyticsRepository } from './drizzle-analytics.repository.js';
import {
  mergeBlockBreakdown,
  mergeClickTrend,
  mergeEditorialFunnel,
  mergeMarketplaceBreakdown,
  mergeOriginBreakdown,
  mergeOriginTrend,
  mergePageBreakdown,
  mergePlacementBreakdown,
  mergeTopClickedProducts,
  mergeConvertingArticles,
  mergeTopArticlesByEvent,
} from '../../telemetry/telemetry-merge.js';

export class CompositeAnalyticsRepository
  implements AnalyticsRepository, EngagementAnalyticsRepository
{
  private readonly pgAnalytics: DrizzleAnalyticsRepository;

  constructor(
    pgAnalytics: DrizzleAnalyticsRepository,
    private readonly bufferStore: TelemetryBufferStore,
  ) {
    this.pgAnalytics = pgAnalytics;
  }

  async getPendingEventCount(from: Date, to: Date): Promise<number> {
    const pending = await this.bufferStore.getPendingAggregates(from, to);
    return pending.pendingEventCount;
  }

  async countTotalClicks(from: Date, to: Date): Promise<number> {
    const [pgTotal, pending] = await Promise.all([
      this.pgAnalytics.countTotalClicks(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return pgTotal + pending.totalClickCount;
  }

  async getClicksTrend(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksTrend(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeClickTrend(pgItems, pending);
  }

  async getClicksByOrigin(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksByOrigin(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeOriginBreakdown(pgItems, pending);
  }

  async getClicksByPlacement(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksByPlacement(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergePlacementBreakdown(pgItems, pending);
  }

  async getClicksByBlock(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksByBlock(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeBlockBreakdown(pgItems, pending);
  }

  async getClicksByPage(from: Date, to: Date, limit: number) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksByPage(from, to, limit),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergePageBreakdown(pgItems, pending, limit);
  }

  async getClicksTrendByOrigin(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksTrendByOrigin(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeOriginTrend(pgItems, pending);
  }

  async getClicksByMarketplace(from: Date, to: Date) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getClicksByMarketplace(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeMarketplaceBreakdown(pgItems, pending);
  }

  async getTopClickedProducts(from: Date, to: Date, limit: number) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getTopClickedProducts(from, to, limit),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeTopClickedProducts(pgItems, pending, limit);
  }

  async getConvertingArticles(from: Date, to: Date, limit: number) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getConvertingArticles(from, to, limit),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeConvertingArticles(pgItems, pending, limit);
  }

  async getVisibleProductCountByMarketplace() {
    return this.pgAnalytics.getVisibleProductCountByMarketplace();
  }

  async getCatalogHealthMetrics() {
    return this.pgAnalytics.getCatalogHealthMetrics();
  }

  async getEditorialFunnel(from: Date, to: Date) {
    const [pgMetrics, pending] = await Promise.all([
      this.pgAnalytics.getEditorialFunnel(from, to),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeEditorialFunnel(pgMetrics, pending);
  }

  async getTopArticlesByEvent(from: Date, to: Date, eventType: string, limit: number) {
    const [pgItems, pending] = await Promise.all([
      this.pgAnalytics.getTopArticlesByEvent(from, to, eventType, limit),
      this.bufferStore.getPendingAggregates(from, to),
    ]);
    return mergeTopArticlesByEvent(pgItems, pending, eventType, limit);
  }
}
