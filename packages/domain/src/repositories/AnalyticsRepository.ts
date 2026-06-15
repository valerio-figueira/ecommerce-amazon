export type ClickTrendPoint = {
  date: string;
  count: number;
};

export type OriginClickBreakdown = {
  origin: string;
  count: number;
  sharePercent: number;
};

export type PlacementClickBreakdown = {
  placement: string;
  count: number;
  sharePercent: number;
};

export type BlockClickBreakdown = {
  blockId: string;
  blockType: string;
  pageSlug: string;
  count: number;
};

export type PagePathClickBreakdown = {
  pagePath: string;
  count: number;
};

export type OriginTrendPoint = {
  date: string;
  origin: string;
  count: number;
};

export type MarketplaceClickBreakdown = {
  marketplace: string;
  count: number;
  sharePercent: number;
};

export type MarketplaceCatalogBreakdown = {
  marketplace: string;
  count: number;
  sharePercent: number;
};

export type MarketplaceClickInsight = MarketplaceClickBreakdown & {
  catalogCount: number;
  catalogSharePercent: number;
  clickIndex: number | null;
};

export type TopClickedProduct = {
  productId: string;
  slug: string;
  title: string;
  marketplace: string;
  clickCount: number;
};

export type ConvertingArticle = {
  articleId: string;
  slug: string;
  title: string;
  clickCount: number;
  embedClickCount: number;
  comparadorClickCount: number;
};

export type EditorialFunnelArticleStage = {
  articleId: string;
  slug: string;
  title: string;
  count: number;
};

export type EditorialFunnelMetrics = {
  articleCardClicks: number;
  articlePageViews: number;
  embedAffiliateClicks: number;
  cardToViewRatePercent: number | null;
  viewToClickRatePercent: number | null;
  topArticlesByCardClicks: EditorialFunnelArticleStage[];
  topArticlesByPageViews: EditorialFunnelArticleStage[];
  topArticlesByAffiliateClicks: EditorialFunnelArticleStage[];
};

export type CatalogHealthMetrics = {
  totalVisibleProducts: number;
  staleCount: number;
  staleRatePercent: number;
  outOfStockCount: number;
};

export type Ga4AcquisitionRow = {
  channel: string;
  pageViews: number;
  sharePercent: number;
};

export type Ga4CtrByOriginRow = {
  origin: string;
  clicks: number;
  views: number;
  ctrPercent: number | null;
};

export interface AnalyticsRepository {
  countTotalClicks(from: Date, to: Date): Promise<number>;
  getPendingEventCount(from: Date, to: Date): Promise<number>;
  getClicksTrend(from: Date, to: Date): Promise<ClickTrendPoint[]>;
  getClicksByOrigin(from: Date, to: Date): Promise<OriginClickBreakdown[]>;
  getClicksByPlacement(from: Date, to: Date): Promise<PlacementClickBreakdown[]>;
  getClicksByBlock(from: Date, to: Date): Promise<BlockClickBreakdown[]>;
  getClicksByPage(from: Date, to: Date, limit: number): Promise<PagePathClickBreakdown[]>;
  getClicksTrendByOrigin(from: Date, to: Date): Promise<OriginTrendPoint[]>;
  getClicksByMarketplace(from: Date, to: Date): Promise<MarketplaceClickBreakdown[]>;
  getVisibleProductCountByMarketplace(): Promise<MarketplaceCatalogBreakdown[]>;
  getTopClickedProducts(from: Date, to: Date, limit: number): Promise<TopClickedProduct[]>;
  getConvertingArticles(from: Date, to: Date, limit: number): Promise<ConvertingArticle[]>;
  getCatalogHealthMetrics(): Promise<CatalogHealthMetrics>;
}

export interface EngagementAnalyticsRepository {
  getEditorialFunnel(from: Date, to: Date): Promise<EditorialFunnelMetrics>;
  getPendingEventCount(from: Date, to: Date): Promise<number>;
}

export type Ga4TrafficReport = {
  totalPageViews: number;
  acquisition: Ga4AcquisitionRow[];
};

export interface Ga4AnalyticsGateway {
  isConfigured(): boolean;
  getTrafficAcquisition(from: Date, to: Date): Promise<Ga4TrafficReport | null>;
  getEventCountsByParam(
    eventName: string,
    paramName: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, number>>;
}
