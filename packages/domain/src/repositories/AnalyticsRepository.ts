export type ClickTrendPoint = {
  date: string;
  count: number;
};

export type OriginClickBreakdown = {
  origin: string;
  count: number;
  sharePercent: number;
};

export type MarketplaceClickBreakdown = {
  marketplace: string;
  count: number;
  sharePercent: number;
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
  getClicksTrend(from: Date, to: Date): Promise<ClickTrendPoint[]>;
  getClicksByOrigin(from: Date, to: Date): Promise<OriginClickBreakdown[]>;
  getClicksByMarketplace(from: Date, to: Date): Promise<MarketplaceClickBreakdown[]>;
  getTopClickedProducts(from: Date, to: Date, limit: number): Promise<TopClickedProduct[]>;
  getConvertingArticles(from: Date, to: Date, limit: number): Promise<ConvertingArticle[]>;
  getCatalogHealthMetrics(): Promise<CatalogHealthMetrics>;
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
