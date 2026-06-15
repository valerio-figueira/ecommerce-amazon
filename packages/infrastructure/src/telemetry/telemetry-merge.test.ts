import { describe, expect, it } from 'vitest';

import type { PendingTelemetryAggregates } from '@ecommerce-amazon/domain';
import { EngagementEventType } from '@ecommerce-amazon/shared/analytics';

import {
  mergeEditorialFunnel,
  mergeOriginBreakdown,
  mergePlacementBreakdown,
} from './telemetry-merge.js';

describe('telemetry merge helpers', () => {
  const pending: PendingTelemetryAggregates = {
    totalClickCount: 3,
    pendingEventCount: 4,
    clicksByOrigin: { embed: 2, listagem: 1 },
    clicksByPlacement: { 'article.embed': 2 },
    clicksByBlockId: {},
    clicksByPagePath: {},
    clicksTrendByOrigin: [{ date: '2026-06-15', origin: 'embed', count: 2 }],
    clicksTrendByDay: [{ date: '2026-06-15', count: 3 }],
    engagementByType: {
      [EngagementEventType.ARTICLE_CARD_CLICK]: 1,
      [EngagementEventType.ARTICLE_PAGE_VIEW]: 2,
    },
    engagementByArticleAndType: {},
    embedAffiliateClicks: 2,
    affiliateClicksByArticle: {},
  };

  it('merges origin breakdown without double-counting PG totals', () => {
    const merged = mergeOriginBreakdown(
      [{ origin: 'embed', count: 10, sharePercent: 100 }],
      pending,
    );

    expect(merged.find((item) => item.origin === 'embed')?.count).toBe(12);
    expect(merged.find((item) => item.origin === 'listagem')?.count).toBe(1);
  });

  it('merges placement breakdown totals', () => {
    const merged = mergePlacementBreakdown(
      [{ placement: 'article.embed', count: 5, sharePercent: 100 }],
      pending,
    );

    expect(merged[0]?.count).toBe(7);
  });

  it('merges editorial funnel metrics with pending counters', () => {
    const merged = mergeEditorialFunnel(
      {
        articleCardClicks: 10,
        articlePageViews: 20,
        embedAffiliateClicks: 5,
        cardToViewRatePercent: 200,
        viewToClickRatePercent: 25,
        topArticlesByCardClicks: [],
        topArticlesByPageViews: [],
        topArticlesByAffiliateClicks: [],
      },
      pending,
    );

    expect(merged.articleCardClicks).toBe(11);
    expect(merged.articlePageViews).toBe(22);
    expect(merged.embedAffiliateClicks).toBe(7);
  });
});
