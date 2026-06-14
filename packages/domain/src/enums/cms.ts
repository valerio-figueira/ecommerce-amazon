export enum BlockType {
  HERO_CAROUSEL = 'hero_carousel',
  FEATURED_PRODUCT = 'featured_product',
  PRODUCT_GRID = 'product_grid',
  CATEGORY_PILLS = 'category_pills',
  CATEGORY_BENTO_GRID = 'category_bento_grid',
  HERO_SPLIT = 'hero_split',
  CURATED_COLLECTION = 'curated_collection',
  COUPON_STRIP = 'coupon_strip',
  RICH_TEXT = 'rich_text',
  BANNER = 'banner',
  SPACER = 'spacer',
  DYNAMIC_PRODUCT_GRID = 'dynamic_product_grid',
}

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum BlockVisibility {
  ALL = 'all',
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

export enum ProductSortField {
  EDITORIAL_SCORE = 'editorial_score',
  PRICE_UPDATED_AT = 'price_updated_at',
  CREATED_AT = 'created_at',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DISCOUNT_PERCENT_DESC = 'discount_percent_desc',
}
