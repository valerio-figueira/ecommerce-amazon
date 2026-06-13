import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const marketplaceEnum = pgEnum('marketplace', ['amazon_br', 'shopee_br']);
export const availabilityEnum = pgEnum('availability', ['in_stock', 'out_of_stock', 'unknown']);
export const alertStatusEnum = pgEnum('alert_status', [
  'pending',
  'active',
  'triggered',
  'expired',
]);
export const articleTypeEnum = pgEnum('article_type', [
  'guide',
  'review',
  'comparison',
  'lookbook_social',
]);
export const articleStatusEnum = pgEnum('article_status', ['draft', 'published']);
export const couponStatusEnum = pgEnum('coupon_status', ['active', 'expired', 'unverified']);
export const discountTypeEnum = pgEnum('discount_type', ['percent', 'fixed']);
export const snapshotSourceEnum = pgEnum('snapshot_source', ['worker_cron', 'manual_override']);
export const syncJobTypeEnum = pgEnum('sync_job_type', [
  'full_sync',
  'price_refresh',
  'hygiene',
  'link_validation',
  'coupon_verify',
]);
export const syncJobStatusEnum = pgEnum('sync_job_status', ['running', 'completed', 'failed']);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    marketplace: marketplaceEnum('marketplace').notNull(),
    externalId: text('external_id').notNull(),
    slug: text('slug').notNull(),
    titleClean: text('title_clean').notNull(),
    titleRaw: text('title_raw').notNull(),
    shortDescription: text('short_description'),
    longDescriptionHtml: text('long_description_html'),
    priceAmount: decimal('price_amount', { precision: 12, scale: 2 }).notNull(),
    priceStrikethrough: decimal('price_strikethrough', { precision: 12, scale: 2 }),
    currency: text('currency').notNull().default('BRL'),
    stalePrice: boolean('stale_price').notNull().default(false),
    priceUpdatedAt: timestamp('price_updated_at', { withTimezone: true }).notNull(),
    affiliateDeepLink: text('affiliate_deep_link').notNull(),
    images: jsonb('images').$type<string[]>().notNull().default([]),
    specsNormalized: jsonb('specs_normalized').$type<Record<string, string>>().notNull().default({}),
    editorialScore: integer('editorial_score').notNull().default(0),
    availability: availabilityEnum('availability').notNull().default('unknown'),
    rating: decimal('rating', { precision: 3, scale: 2 }),
    reviewCount: integer('review_count'),
    categoryVertical: text('category_vertical'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    pros: jsonb('pros').$type<string[]>(),
    cons: jsonb('cons').$type<string[]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('products_slug_idx').on(table.slug),
    uniqueIndex('products_marketplace_external_idx').on(table.marketplace, table.externalId),
    index('products_stale_price_idx').on(table.stalePrice, table.priceUpdatedAt),
  ],
);

export const priceSnapshots = pgTable(
  'price_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('BRL'),
    source: snapshotSourceEnum('source').notNull().default('worker_cron'),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('price_snapshots_product_captured_idx').on(table.productId, table.capturedAt)],
);

export const priceAlerts = pgTable(
  'price_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    targetPrice: decimal('target_price', { precision: 12, scale: 2 }).notNull(),
    status: alertStatusEnum('status').notNull().default('pending'),
    confirmToken: text('confirm_token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }),
  },
  (table) => [index('price_alerts_product_status_idx').on(table.productId, table.status)],
);

export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  marketplace: marketplaceEnum('marketplace').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contentArticles = pgTable(
  'content_articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    type: articleTypeEnum('type').notNull(),
    status: articleStatusEnum('status').notNull().default('draft'),
    seo: jsonb('seo').$type<Record<string, string>>().notNull().default({}),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('content_articles_slug_idx').on(table.slug)],
);

export const contentProductEmbeds = pgTable('content_product_embeds', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => contentArticles.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  variant: text('variant').notNull().default('inline'),
});

export const curatedCollections = pgTable(
  'curated_collections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    coverImageUrl: text('cover_image_url').notNull(),
    campaignOrigin: text('campaign_origin').notNull(),
    utmDefaults: jsonb('utm_defaults').$type<Record<string, string>>().notNull().default({}),
    ctaText: text('cta_text').notNull(),
  },
  (table) => [uniqueIndex('curated_collections_slug_idx').on(table.slug)],
);

export const collectionProducts = pgTable('collection_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectionId: uuid('collection_id')
    .notNull()
    .references(() => curatedCollections.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const productComparisons = pgTable('product_comparisons', {
  id: uuid('id').primaryKey().defaultRandom(),
  shareToken: text('share_token').notNull().unique(),
  sessionId: text('session_id').notNull(),
  editorialIntro: text('editorial_intro').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const comparisonProducts = pgTable('comparison_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  comparisonId: uuid('comparison_id')
    .notNull()
    .references(() => productComparisons.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketplace: marketplaceEnum('marketplace').notNull(),
  code: text('code').notNull(),
  description: text('description').notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  discountType: discountTypeEnum('discount_type').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  status: couponStatusEnum('status').notNull().default('unverified'),
  sourceUrl: text('source_url').notNull(),
  lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }).notNull(),
});

export const syncJobLogs = pgTable('sync_job_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobType: syncJobTypeEnum('job_type').notNull(),
  status: syncJobStatusEnum('status').notNull(),
  itemsProcessed: integer('items_processed').notNull().default(0),
  errors: jsonb('errors').$type<unknown[]>().notNull().default([]),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export const clickEvents = pgTable('click_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  origin: text('origin').notNull(),
  sessionId: text('session_id'),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
});

export const affiliateAccounts = pgTable('affiliate_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketplace: marketplaceEnum('marketplace').notNull(),
  affiliateTag: text('affiliate_tag').notNull(),
  status: text('status').notNull(),
  validatedBy: text('validated_by'),
  validatedAt: timestamp('validated_at', { withTimezone: true }),
});
