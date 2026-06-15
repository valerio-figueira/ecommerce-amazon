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
