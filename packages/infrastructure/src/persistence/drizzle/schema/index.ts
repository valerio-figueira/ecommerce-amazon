import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { articleCategories } from './article-categories.js';
import { categories } from './categories.js';
import { contentClusters } from './content-clusters.js';

export { articleCategories, categories, contentClusters };

export const marketplaceEnum = pgEnum('marketplace', [
  'amazon_br',
  'shopee_br',
  'mercadolivre_br',
]);
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
export const pageStatusEnum = pgEnum('page_status', ['draft', 'published']);
export const pageKindEnum = pgEnum('page_kind', ['block_layout', 'institutional']);
export const blockVisibilityEnum = pgEnum('block_visibility', ['all', 'desktop', 'mobile']);
export const blockTypeEnum = pgEnum('block_type', [
  'hero_carousel',
  'featured_product',
  'product_grid',
  'category_pills',
  'category_bento_grid',
  'hero_split',
  'curated_collection',
  'coupon_strip',
  'rich_text',
  'banner',
  'spacer',
  'dynamic_product_grid',
  'bento_hub_mix',
]);

export const pages = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    status: pageStatusEnum('status').notNull().default('draft'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    pageKind: pageKindEnum('page_kind').notNull().default('block_layout'),
    institutionalContent: jsonb('institutional_content').$type<Record<string, unknown>>(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('pages_slug_status_idx').on(table.slug, table.status)],
);

export const pageBlocks = pgTable(
  'page_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    type: blockTypeEnum('type').notNull(),
    sortOrder: integer('sort_order').notNull(),
    props: jsonb('props').$type<Record<string, unknown>>().notNull().default({}),
    visibility: blockVisibilityEnum('visibility').notNull().default('all'),
  },
  (table) => [index('page_blocks_page_sort_idx').on(table.pageId, table.sortOrder)],
);

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
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    canonicalUrl: varchar('canonical_url', { length: 512 }),
    pros: jsonb('pros').$type<string[]>(),
    cons: jsonb('cons').$type<string[]>(),
    visible: boolean('visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('products_slug_idx').on(table.slug),
    uniqueIndex('products_marketplace_external_idx').on(table.marketplace, table.externalId),
    index('products_stale_price_idx').on(table.stalePrice, table.priceUpdatedAt),
    index('products_visible_idx').on(table.visible),
    index('products_category_id_idx').on(table.categoryId),
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
    excerpt: text('excerpt').notNull().default(''),
    coverImageUrl: varchar('cover_image_url', { length: 255 }),
    body: text('body').notNull(),
    type: articleTypeEnum('type').notNull(),
    status: articleStatusEnum('status').notNull().default('draft'),
    authorId: uuid('author_id').references(() => operators.id, { onDelete: 'set null' }),
    categoryId: uuid('category_id').references(() => articleCategories.id, {
      onDelete: 'set null',
    }),
    clusterId: uuid('cluster_id').references(() => contentClusters.id, { onDelete: 'set null' }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seo: jsonb('seo').$type<Record<string, string>>().notNull().default({}),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('content_articles_slug_idx').on(table.slug),
    index('content_articles_cluster_id_idx').on(table.clusterId),
  ],
);

export const autoLinks = pgTable(
  'auto_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    keyword: varchar('keyword', { length: 120 }).notNull(),
    targetUrl: varchar('target_url', { length: 255 }).notNull(),
    maxMatches: integer('max_matches').notNull().default(1),
    priority: integer('priority').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('auto_links_active_priority_idx').on(table.isActive, table.priority)],
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
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('curated_collections_slug_idx').on(table.slug)],
);

export const collectionProducts = pgTable(
  'collection_products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => curatedCollections.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [unique('collection_products_collection_product_idx').on(table.collectionId, table.productId)],
);

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

export const clickEvents = pgTable(
  'click_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    blockId: uuid('block_id').references(() => pageBlocks.id, { onDelete: 'set null' }),
    articleId: uuid('article_id').references(() => contentArticles.id, { onDelete: 'set null' }),
    collectionId: uuid('collection_id').references(() => curatedCollections.id, {
      onDelete: 'set null',
    }),
    origin: text('origin').notNull(),
    placement: text('placement'),
    pagePath: text('page_path'),
    referrerPath: text('referrer_path'),
    sessionId: text('session_id'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('click_events_block_id_idx').on(table.blockId),
    index('click_events_occurred_at_idx').on(table.occurredAt),
    index('click_events_product_occurred_idx').on(table.productId, table.occurredAt),
    index('click_events_origin_occurred_idx').on(table.origin, table.occurredAt),
    index('click_events_article_id_idx').on(table.articleId),
    index('click_events_placement_occurred_idx').on(table.placement, table.occurredAt),
    index('click_events_page_path_occurred_idx').on(table.pagePath, table.occurredAt),
    index('click_events_collection_id_occurred_idx').on(table.collectionId, table.occurredAt),
  ],
);

export const contentEngagementEvents = pgTable(
  'content_engagement_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventType: text('event_type').notNull(),
    articleId: uuid('article_id').references(() => contentArticles.id, { onDelete: 'set null' }),
    pagePath: text('page_path').notNull(),
    placement: text('placement'),
    blockId: uuid('block_id').references(() => pageBlocks.id, { onDelete: 'set null' }),
    referrerPath: text('referrer_path'),
    sessionId: text('session_id'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('content_engagement_events_type_occurred_idx').on(table.eventType, table.occurredAt),
    index('content_engagement_events_article_occurred_idx').on(table.articleId, table.occurredAt),
  ],
);

export const affiliateAccounts = pgTable('affiliate_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketplace: marketplaceEnum('marketplace').notNull(),
  affiliateTag: text('affiliate_tag').notNull(),
  status: text('status').notNull(),
  validatedBy: text('validated_by'),
  validatedAt: timestamp('validated_at', { withTimezone: true }),
});

export const operatorStatusEnum = pgEnum('operator_status', ['active', 'disabled']);
export const operatorRoleEnum = pgEnum('operator_role', ['admin', 'editor']);
export const teamPublicRoleEnum = pgEnum('team_public_role', ['founder', 'member']);

export const operators = pgTable('operators', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: varchar('bio', { length: 250 }),
  role: operatorRoleEnum('role').notNull().default('admin'),
  status: operatorStatusEnum('status').notNull().default('active'),
  jobTitle: varchar('job_title', { length: 120 }),
  socialLinks: jsonb('social_links').$type<{
    linkedin?: string;
    instagram?: string;
    x?: string;
    telegram?: string;
  }>(),
  showOnTeam: boolean('show_on_team').notNull().default(false),
  teamSortOrder: smallint('team_sort_order'),
  teamPublicRole: teamPublicRoleEnum('team_public_role').default('member'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
