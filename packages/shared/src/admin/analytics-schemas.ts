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
  pendingEventCount: z.number().optional(),
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
  pendingEventCount: z.number().optional(),
});

export const marketplaceBreakdownItemSchema = z.object({
  marketplace: z.string(),
  count: z.number(),
  sharePercent: z.number(),
  catalogCount: z.number(),
  catalogSharePercent: z.number(),
  clickIndex: z.number().nullable().optional(),
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
  embedClickCount: z.number(),
  comparadorClickCount: z.number(),
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

export const placementBreakdownItemSchema = z.object({
  placement: z.string(),
  count: z.number(),
  sharePercent: z.number(),
});

export const clicksByPlacementResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(placementBreakdownItemSchema),
  pendingEventCount: z.number().optional(),
});

export const blockAttributionItemSchema = z.object({
  blockId: z.string().uuid(),
  blockType: z.string(),
  pageSlug: z.string(),
  count: z.number(),
});

export const clicksByBlockResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(blockAttributionItemSchema),
  pendingEventCount: z.number().optional(),
});

export const pagePathBreakdownItemSchema = z.object({
  pagePath: z.string(),
  count: z.number(),
});

export const clicksByPageResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(pagePathBreakdownItemSchema),
  pendingEventCount: z.number().optional(),
});

export const originTrendPointSchema = z.object({
  date: z.string(),
  origin: z.string(),
  count: z.number(),
});

export const clicksTrendByOriginResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  items: z.array(originTrendPointSchema),
  pendingEventCount: z.number().optional(),
});

export const editorialFunnelArticleStageSchema = z.object({
  articleId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  count: z.number(),
});

export const editorialFunnelResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  pendingEventCount: z.number().optional(),
  articleCardClicks: z.number(),
  articlePageViews: z.number(),
  embedAffiliateClicks: z.number(),
  cardToViewRatePercent: z.number().nullable(),
  viewToClickRatePercent: z.number().nullable(),
  topArticlesByCardClicks: z.array(editorialFunnelArticleStageSchema),
  topArticlesByPageViews: z.array(editorialFunnelArticleStageSchema),
  topArticlesByAffiliateClicks: z.array(editorialFunnelArticleStageSchema),
});

export type AnalyticsOverviewResponse = z.infer<typeof analyticsOverviewResponseSchema>;
export type ClicksByOriginResponse = z.infer<typeof clicksByOriginResponseSchema>;
export type ClicksByMarketplaceResponse = z.infer<typeof clicksByMarketplaceResponseSchema>;
export type TopClickedProductsResponse = z.infer<typeof topClickedProductsResponseSchema>;
export type ConvertingArticlesResponse = z.infer<typeof convertingArticlesResponseSchema>;
export type Ga4TrafficAcquisitionResponse = z.infer<typeof ga4TrafficAcquisitionResponseSchema>;
export type CtrByOriginResponse = z.infer<typeof ctrByOriginResponseSchema>;
export type ClicksByPlacementResponse = z.infer<typeof clicksByPlacementResponseSchema>;
export type ClicksByBlockResponse = z.infer<typeof clicksByBlockResponseSchema>;
export type ClicksByPageResponse = z.infer<typeof clicksByPageResponseSchema>;
export type ClicksTrendByOriginResponse = z.infer<typeof clicksTrendByOriginResponseSchema>;
export type EditorialFunnelResponse = z.infer<typeof editorialFunnelResponseSchema>;
