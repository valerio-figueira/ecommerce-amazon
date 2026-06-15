export const ClickPlacement = {
  ARTICLE_EMBED: 'article.embed',
  ARTICLE_COMPARISON: 'article.comparison',
  ARTICLE_RELATED: 'article.related',
  ARTICLE_LISTING: 'article_listing',
  CMS_PRODUCT_GRID: 'cms.product_grid',
  CMS_FEATURED_PRODUCT: 'cms.featured_product',
  CMS_BENTO_OFFER: 'cms.bento_offer',
  CMS_BENTO_LIST: 'cms.bento_list',
  CMS_BENTO_ARTICLE: 'cms.bento_article',
  CMS_CURATED_COLLECTION: 'cms.curated_collection',
  PRODUCT_DETAIL_CTA: 'product.detail_cta',
  PRODUCT_SIMILAR: 'product.similar',
  CATEGORY_LISTING: 'category.listing',
  COLLECTION_PAGE: 'collection.page',
  WISHLIST_DRAWER: 'wishlist.drawer',
} as const;

export type ClickPlacementValue = (typeof ClickPlacement)[keyof typeof ClickPlacement];

export const CLICK_PLACEMENT_VALUES = Object.values(ClickPlacement) as [
  ClickPlacementValue,
  ...ClickPlacementValue[],
];

export const EngagementEventType = {
  ARTICLE_CARD_CLICK: 'article_card_click',
  ARTICLE_PAGE_VIEW: 'article_page_view',
} as const;

export type EngagementEventTypeValue =
  (typeof EngagementEventType)[keyof typeof EngagementEventType];

export const ENGAGEMENT_EVENT_TYPE_VALUES = Object.values(EngagementEventType) as [
  EngagementEventTypeValue,
  ...EngagementEventTypeValue[],
];

export const ENGAGEMENT_PLACEMENT_VALUES = [
  ClickPlacement.ARTICLE_LISTING,
  ClickPlacement.ARTICLE_RELATED,
  ClickPlacement.CMS_BENTO_ARTICLE,
] as const;

export type EngagementPlacementValue = (typeof ENGAGEMENT_PLACEMENT_VALUES)[number];
