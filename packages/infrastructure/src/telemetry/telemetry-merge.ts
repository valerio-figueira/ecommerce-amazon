import type {
  BlockClickBreakdown,
  ClickTrendPoint,
  EditorialFunnelArticleStage,
  EditorialFunnelMetrics,
  OriginClickBreakdown,
  OriginTrendPoint,
  PagePathClickBreakdown,
  PendingTelemetryAggregates,
  PlacementClickBreakdown,
} from '@ecommerce-amazon/domain';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';

export function mergeOriginBreakdown(
  pgItems: OriginClickBreakdown[],
  pending: PendingTelemetryAggregates,
): OriginClickBreakdown[] {
  const counts = new Map<string, number>();
  for (const item of pgItems) {
    counts.set(item.origin, item.count);
  }
  for (const [origin, count] of Object.entries(pending.clicksByOrigin)) {
    counts.set(origin, (counts.get(origin) ?? 0) + count);
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return [...counts.entries()]
    .map(([origin, count]) => ({
      origin,
      count,
      sharePercent: toSharePercent(count, total),
    }))
    .sort((left, right) => right.count - left.count);
}

export function mergePlacementBreakdown(
  pgItems: PlacementClickBreakdown[],
  pending: PendingTelemetryAggregates,
): PlacementClickBreakdown[] {
  const counts = new Map<string, number>();
  for (const item of pgItems) {
    counts.set(item.placement, item.count);
  }
  for (const [placement, count] of Object.entries(pending.clicksByPlacement)) {
    counts.set(placement, (counts.get(placement) ?? 0) + count);
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return [...counts.entries()]
    .map(([placement, count]) => ({
      placement,
      count,
      sharePercent: toSharePercent(count, total),
    }))
    .sort((left, right) => right.count - left.count);
}

export function mergeBlockBreakdown(
  pgItems: BlockClickBreakdown[],
  pending: PendingTelemetryAggregates,
): BlockClickBreakdown[] {
  const byBlock = new Map<string, BlockClickBreakdown>();
  for (const item of pgItems) {
    byBlock.set(item.blockId, { ...item });
  }
  for (const [blockId, count] of Object.entries(pending.clicksByBlockId)) {
    const existing = byBlock.get(blockId);
    if (existing) {
      existing.count += count;
      continue;
    }
    byBlock.set(blockId, {
      blockId,
      blockType: 'pending',
      pageSlug: '—',
      count,
    });
  }

  return [...byBlock.values()].sort((left, right) => right.count - left.count);
}

export function mergePageBreakdown(
  pgItems: PagePathClickBreakdown[],
  pending: PendingTelemetryAggregates,
  limit: number,
): PagePathClickBreakdown[] {
  const counts = new Map<string, number>();
  for (const item of pgItems) {
    counts.set(item.pagePath, item.count);
  }
  for (const [pagePath, count] of Object.entries(pending.clicksByPagePath)) {
    counts.set(pagePath, (counts.get(pagePath) ?? 0) + count);
  }

  return [...counts.entries()]
    .map(([pagePath, count]) => ({ pagePath, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

export function mergeOriginTrend(
  pgItems: OriginTrendPoint[],
  pending: PendingTelemetryAggregates,
): OriginTrendPoint[] {
  const counts = new Map<string, number>();
  for (const item of pgItems) {
    counts.set(`${item.date}:${item.origin}`, item.count);
  }
  for (const item of pending.clicksTrendByOrigin) {
    const key = `${item.date}:${item.origin}`;
    counts.set(key, (counts.get(key) ?? 0) + item.count);
  }

  return [...counts.entries()]
    .map(([key, count]) => {
      const [date, origin] = key.split(':');
      return { date: date ?? '', origin: origin ?? '', count };
    })
    .sort((left, right) => left.date.localeCompare(right.date) || left.origin.localeCompare(right.origin));
}

export function mergeClickTrend(
  pgItems: ClickTrendPoint[],
  pending: PendingTelemetryAggregates,
): ClickTrendPoint[] {
  const counts = new Map<string, number>();
  for (const item of pgItems) {
    counts.set(item.date, item.count);
  }
  for (const item of pending.clicksTrendByDay) {
    counts.set(item.date, (counts.get(item.date) ?? 0) + item.count);
  }

  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function mergeEditorialFunnel(
  pgMetrics: EditorialFunnelMetrics,
  pending: PendingTelemetryAggregates,
): EditorialFunnelMetrics {
  const articleCardClicks =
    pgMetrics.articleCardClicks +
    (pending.engagementByType[EngagementEventType.ARTICLE_CARD_CLICK] ?? 0);
  const articlePageViews =
    pgMetrics.articlePageViews +
    (pending.engagementByType[EngagementEventType.ARTICLE_PAGE_VIEW] ?? 0);
  const embedAffiliateClicks = pgMetrics.embedAffiliateClicks + pending.embedAffiliateClicks;

  return {
    articleCardClicks,
    articlePageViews,
    embedAffiliateClicks,
    cardToViewRatePercent: toRatePercent(articlePageViews, articleCardClicks),
    viewToClickRatePercent: toRatePercent(embedAffiliateClicks, articlePageViews),
    topArticlesByCardClicks: mergeFunnelArticleStages(
      pgMetrics.topArticlesByCardClicks,
      pending,
      EngagementEventType.ARTICLE_CARD_CLICK,
    ),
    topArticlesByPageViews: mergeFunnelArticleStages(
      pgMetrics.topArticlesByPageViews,
      pending,
      EngagementEventType.ARTICLE_PAGE_VIEW,
    ),
    topArticlesByAffiliateClicks: mergeAffiliateArticleStages(
      pgMetrics.topArticlesByAffiliateClicks,
      pending,
    ),
  };
}

function mergeFunnelArticleStages(
  pgItems: EditorialFunnelArticleStage[],
  pending: PendingTelemetryAggregates,
  eventType: string,
): EditorialFunnelArticleStage[] {
  const counts = new Map<string, EditorialFunnelArticleStage>();
  for (const item of pgItems) {
    counts.set(item.articleId, { ...item });
  }

  for (const [compositeKey, count] of Object.entries(pending.engagementByArticleAndType)) {
    const [pendingEventType, articleId] = compositeKey.split(':');
    if (pendingEventType !== eventType || !articleId) continue;
    const existing = counts.get(articleId);
    if (existing) {
      existing.count += count;
      continue;
    }
    counts.set(articleId, {
      articleId,
      slug: '—',
      title: 'Evento pendente',
      count,
    });
  }

  return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, 5);
}

function mergeAffiliateArticleStages(
  pgItems: EditorialFunnelArticleStage[],
  pending: PendingTelemetryAggregates,
): EditorialFunnelArticleStage[] {
  const counts = new Map<string, EditorialFunnelArticleStage>();
  for (const item of pgItems) {
    counts.set(item.articleId, { ...item });
  }

  for (const [articleId, count] of Object.entries(pending.affiliateClicksByArticle)) {
    const existing = counts.get(articleId);
    if (existing) {
      existing.count += count;
      continue;
    }
    counts.set(articleId, {
      articleId,
      slug: '—',
      title: 'Evento pendente',
      count,
    });
  }

  return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, 5);
}

function toSharePercent(countValue: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((countValue / total) * 1000) / 10;
}

function toRatePercent(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}
