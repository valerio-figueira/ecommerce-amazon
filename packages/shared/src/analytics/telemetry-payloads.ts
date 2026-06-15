export type ClickEventPayload = {
  productId: string;
  origin: string;
  marketplace?: string;
  sessionId?: string;
  blockId?: string;
  articleId?: string;
  collectionId?: string;
  placement?: string;
  pagePath?: string;
  referrerPath?: string;
  occurredAt: string;
};

export type EngagementEventPayload = {
  eventType: string;
  articleId: string;
  pagePath: string;
  placement?: string;
  blockId?: string;
  referrerPath?: string;
  sessionId?: string;
  occurredAt: string;
};

export type PendingTelemetryAggregates = {
  totalClickCount: number;
  pendingEventCount: number;
  clicksByOrigin: Record<string, number>;
  clicksByPlacement: Record<string, number>;
  clicksByBlockId: Record<string, number>;
  clicksByPagePath: Record<string, number>;
  clicksTrendByOrigin: Array<{ date: string; origin: string; count: number }>;
  clicksTrendByDay: Array<{ date: string; count: number }>;
  engagementByType: Record<string, number>;
  engagementByArticleAndType: Record<string, number>;
  embedAffiliateClicks: number;
  affiliateClicksByArticle: Record<string, number>;
  affiliateClicksByArticleAndOrigin: Record<string, number>;
  clicksByProductId: Record<string, number>;
  clicksByMarketplace: Record<string, number>;
};
