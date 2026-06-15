import { z } from 'zod';

export const analyticsDateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const analyticsTopLimitQuerySchema = analyticsDateRangeQuerySchema.extend({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const catalogHealthSchema = z.object({
  totalVisibleProducts: z.number(),
  staleCount: z.number(),
  staleRatePercent: z.number(),
  outOfStockCount: z.number(),
});

const clickTrendPointSchema = z.object({
  date: z.string(),
  count: z.number(),
});

export const analyticsOverviewResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  totalClicks: z.number(),
  clicksTrend: z.array(clickTrendPointSchema),
  catalogHealth: catalogHealthSchema,
});

export const originBreakdownItemSchema = z.object({
  origin: z.string(),
  count: z.number(),
  sharePercent: z.number(),
});

export const clicksByOriginResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(originBreakdownItemSchema),
});

export const marketplaceBreakdownItemSchema = z.object({
  marketplace: z.string(),
  count: z.number(),
  sharePercent: z.number(),
});

export const clicksByMarketplaceResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(marketplaceBreakdownItemSchema),
});

export const topClickedProductSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  marketplace: z.string(),
  clickCount: z.number(),
});

export const topClickedProductsResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(topClickedProductSchema),
});

export const convertingArticleSchema = z.object({
  articleId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  clickCount: z.number(),
});

export const convertingArticlesResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(convertingArticleSchema),
});

export const ga4AcquisitionItemSchema = z.object({
  channel: z.string(),
  pageViews: z.number(),
  sharePercent: z.number(),
});

export const ga4TrafficAcquisitionResponseSchema = z.object({
  configured: z.boolean(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  totalPageViews: z.number(),
  items: z.array(ga4AcquisitionItemSchema),
});

export const ctrByOriginItemSchema = z.object({
  origin: z.string(),
  clicks: z.number(),
  views: z.number(),
  ctrPercent: z.number().nullable(),
});

export const ctrByOriginResponseSchema = z.object({
  configured: z.boolean(),
  from: z.string(),
  to: z.string(),
  items: z.array(ctrByOriginItemSchema),
});

export type AnalyticsOverviewResponse = z.infer<typeof analyticsOverviewResponseSchema>;
export type ClicksByOriginResponse = z.infer<typeof clicksByOriginResponseSchema>;
export type ClicksByMarketplaceResponse = z.infer<typeof clicksByMarketplaceResponseSchema>;
export type TopClickedProductsResponse = z.infer<typeof topClickedProductsResponseSchema>;
export type ConvertingArticlesResponse = z.infer<typeof convertingArticlesResponseSchema>;
export type Ga4TrafficAcquisitionResponse = z.infer<typeof ga4TrafficAcquisitionResponseSchema>;
export type CtrByOriginResponse = z.infer<typeof ctrByOriginResponseSchema>;
