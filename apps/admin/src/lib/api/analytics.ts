import {
  analyticsDateRangeQuerySchema,
  analyticsOverviewResponseSchema,
  clicksByMarketplaceResponseSchema,
  clicksByOriginResponseSchema,
  convertingArticlesResponseSchema,
  ctrByOriginResponseSchema,
  ga4TrafficAcquisitionResponseSchema,
  topClickedProductsResponseSchema,
  type AnalyticsOverviewResponse,
  type ClicksByMarketplaceResponse,
  type ClicksByOriginResponse,
  type ConvertingArticlesResponse,
  type CtrByOriginResponse,
  type Ga4TrafficAcquisitionResponse,
  type TopClickedProductsResponse,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from '@/lib/api/admin-fetch';

export type AnalyticsDateRange = {
  from?: string;
  to?: string;
};

function buildQuery(range?: AnalyticsDateRange): string {
  const params = analyticsDateRangeQuerySchema.parse(range ?? {});
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  const query = search.toString();
  return query.length > 0 ? `?${query}` : '';
}

export async function fetchAnalyticsOverview(
  range?: AnalyticsDateRange,
): Promise<AnalyticsOverviewResponse> {
  return adminFetchParsed(
    `/admin/analytics/overview${buildQuery(range)}`,
    analyticsOverviewResponseSchema,
  );
}

export async function fetchClicksByOrigin(
  range?: AnalyticsDateRange,
): Promise<ClicksByOriginResponse> {
  return adminFetchParsed(
    `/admin/analytics/clicks/by-origin${buildQuery(range)}`,
    clicksByOriginResponseSchema,
  );
}

export async function fetchClicksByMarketplace(
  range?: AnalyticsDateRange,
): Promise<ClicksByMarketplaceResponse> {
  return adminFetchParsed(
    `/admin/analytics/clicks/by-marketplace${buildQuery(range)}`,
    clicksByMarketplaceResponseSchema,
  );
}

export async function fetchTopClickedProducts(
  range?: AnalyticsDateRange,
): Promise<TopClickedProductsResponse> {
  const params = new URLSearchParams();
  const parsed = analyticsDateRangeQuerySchema.parse(range ?? {});
  if (parsed.from) params.set('from', parsed.from);
  if (parsed.to) params.set('to', parsed.to);
  params.set('limit', '10');
  return adminFetchParsed(
    `/admin/analytics/clicks/top-products?${params.toString()}`,
    topClickedProductsResponseSchema,
  );
}

export async function fetchConvertingArticles(
  range?: AnalyticsDateRange,
): Promise<ConvertingArticlesResponse> {
  const params = new URLSearchParams();
  const parsed = analyticsDateRangeQuerySchema.parse(range ?? {});
  if (parsed.from) params.set('from', parsed.from);
  if (parsed.to) params.set('to', parsed.to);
  params.set('limit', '10');
  return adminFetchParsed(
    `/admin/analytics/articles/converting?${params.toString()}`,
    convertingArticlesResponseSchema,
  );
}

export async function fetchGa4TrafficAcquisition(
  range?: AnalyticsDateRange,
): Promise<Ga4TrafficAcquisitionResponse> {
  return adminFetchParsed(
    `/admin/analytics/traffic/acquisition${buildQuery(range)}`,
    ga4TrafficAcquisitionResponseSchema,
  );
}

export async function fetchCtrByOrigin(range?: AnalyticsDateRange): Promise<CtrByOriginResponse> {
  return adminFetchParsed(
    `/admin/analytics/ctr/by-origin${buildQuery(range)}`,
    ctrByOriginResponseSchema,
  );
}

export function resolveDefaultDateRange(): AnalyticsDateRange {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function resolveDateRangeFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AnalyticsDateRange {
  const from = typeof searchParams['from'] === 'string' ? searchParams['from'] : undefined;
  const to = typeof searchParams['to'] === 'string' ? searchParams['to'] : undefined;
  if (from || to) {
    return { ...(from ? { from } : {}), ...(to ? { to } : {}) };
  }
  return resolveDefaultDateRange();
}

function emptyRangeFields(range?: AnalyticsDateRange): { from: string; to: string } {
  const resolved = resolveDefaultDateRange();
  return {
    from: range?.from ?? resolved.from ?? new Date(0).toISOString(),
    to: range?.to ?? resolved.to ?? new Date().toISOString(),
  };
}

export const emptyAnalyticsOverview: AnalyticsOverviewResponse = {
  from: new Date(0).toISOString(),
  to: new Date().toISOString(),
  totalClicks: 0,
  clicksTrend: [],
  catalogHealth: {
    totalVisibleProducts: 0,
    staleCount: 0,
    staleRatePercent: 0,
    outOfStockCount: 0,
  },
};

export const emptyClicksByOrigin: ClicksByOriginResponse = {
  from: new Date(0).toISOString(),
  to: new Date().toISOString(),
  items: [],
};

export const emptyClicksByMarketplace: ClicksByMarketplaceResponse = {
  from: new Date(0).toISOString(),
  to: new Date().toISOString(),
  items: [],
};

export const emptyTopClickedProducts: TopClickedProductsResponse = {
  from: new Date(0).toISOString(),
  to: new Date().toISOString(),
  items: [],
};

export const emptyConvertingArticles: ConvertingArticlesResponse = {
  from: new Date(0).toISOString(),
  to: new Date().toISOString(),
  items: [],
};

export const emptyGa4TrafficAcquisition: Ga4TrafficAcquisitionResponse = {
  configured: false,
  from: null,
  to: null,
  totalPageViews: 0,
  items: [],
};

async function safeAnalyticsFetch<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  onFailure: () => void,
): Promise<T> {
  try {
    return await fetcher();
  } catch {
    onFailure();
    return fallback;
  }
}

export type DashboardAnalyticsData = {
  apiUnavailable: boolean;
  overview: AnalyticsOverviewResponse;
  byOrigin: ClicksByOriginResponse;
  byMarketplace: ClicksByMarketplaceResponse;
  topProducts: TopClickedProductsResponse;
  convertingArticles: ConvertingArticlesResponse;
  ga4Traffic: Ga4TrafficAcquisitionResponse;
};

export async function loadDashboardAnalytics(
  range?: AnalyticsDateRange,
): Promise<DashboardAnalyticsData> {
  const rangeFields = emptyRangeFields(range);
  const emptyOverview = { ...emptyAnalyticsOverview, ...rangeFields };
  const emptyOrigin = { ...emptyClicksByOrigin, ...rangeFields };
  const emptyMarketplace = { ...emptyClicksByMarketplace, ...rangeFields };
  const emptyTopProducts = { ...emptyTopClickedProducts, ...rangeFields };
  const emptyArticles = { ...emptyConvertingArticles, ...rangeFields };

  let apiUnavailable = false;
  const markUnavailable = (): void => {
    apiUnavailable = true;
  };

  const [
    overview,
    byOrigin,
    byMarketplace,
    topProducts,
    convertingArticles,
    ga4Traffic,
  ] = await Promise.all([
    safeAnalyticsFetch(() => fetchAnalyticsOverview(range), emptyOverview, markUnavailable),
    safeAnalyticsFetch(() => fetchClicksByOrigin(range), emptyOrigin, markUnavailable),
    safeAnalyticsFetch(() => fetchClicksByMarketplace(range), emptyMarketplace, markUnavailable),
    safeAnalyticsFetch(() => fetchTopClickedProducts(range), emptyTopProducts, markUnavailable),
    safeAnalyticsFetch(() => fetchConvertingArticles(range), emptyArticles, markUnavailable),
    safeAnalyticsFetch(
      () => fetchGa4TrafficAcquisition(range),
      emptyGa4TrafficAcquisition,
      markUnavailable,
    ),
  ]);

  return {
    apiUnavailable,
    overview,
    byOrigin,
    byMarketplace,
    topProducts,
    convertingArticles,
    ga4Traffic,
  };
}
