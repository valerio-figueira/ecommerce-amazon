-- Initial schema migration for vitrine platform
CREATE TYPE "public"."marketplace" AS ENUM('amazon_br', 'shopee_br');
CREATE TYPE "public"."availability" AS ENUM('in_stock', 'out_of_stock', 'unknown');
CREATE TYPE "public"."alert_status" AS ENUM('pending', 'active', 'triggered', 'expired');
CREATE TYPE "public"."article_type" AS ENUM('guide', 'review', 'comparison', 'lookbook_social');
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."coupon_status" AS ENUM('active', 'expired', 'unverified');
CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed');
CREATE TYPE "public"."snapshot_source" AS ENUM('worker_cron', 'manual_override');
CREATE TYPE "public"."sync_job_type" AS ENUM('full_sync', 'price_refresh', 'hygiene', 'link_validation', 'coupon_verify');
CREATE TYPE "public"."sync_job_status" AS ENUM('running', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "marketplace" "marketplace" NOT NULL,
  "external_id" text NOT NULL,
  "slug" text NOT NULL,
  "title_clean" text NOT NULL,
  "title_raw" text NOT NULL,
  "short_description" text,
  "long_description_html" text,
  "price_amount" numeric(12, 2) NOT NULL,
  "price_strikethrough" numeric(12, 2),
  "currency" text DEFAULT 'BRL' NOT NULL,
  "stale_price" boolean DEFAULT false NOT NULL,
  "price_updated_at" timestamp with time zone NOT NULL,
  "affiliate_deep_link" text NOT NULL,
  "images" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "specs_normalized" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "editorial_score" integer DEFAULT 0 NOT NULL,
  "availability" "availability" DEFAULT 'unknown' NOT NULL,
  "rating" numeric(3, 2),
  "review_count" integer,
  "category_vertical" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "meta_title" text,
  "meta_description" text,
  "pros" jsonb,
  "cons" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_idx" ON "products" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "products_marketplace_external_idx" ON "products" ("marketplace", "external_id");
CREATE INDEX IF NOT EXISTS "products_stale_price_idx" ON "products" ("stale_price", "price_updated_at");

CREATE TABLE IF NOT EXISTS "price_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "amount" numeric(12, 2) NOT NULL,
  "currency" text DEFAULT 'BRL' NOT NULL,
  "source" "snapshot_source" DEFAULT 'worker_cron' NOT NULL,
  "captured_at" timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS "price_snapshots_product_captured_idx" ON "price_snapshots" ("product_id", "captured_at");

CREATE TABLE IF NOT EXISTS "price_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "email" text NOT NULL,
  "target_price" numeric(12, 2) NOT NULL,
  "status" "alert_status" DEFAULT 'pending' NOT NULL,
  "confirm_token" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "triggered_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "price_alerts_product_status_idx" ON "price_alerts" ("product_id", "status");

CREATE TABLE IF NOT EXISTS "wishlist_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "marketplace" "marketplace" NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "added_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "content_articles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "type" "article_type" NOT NULL,
  "status" "article_status" DEFAULT 'draft' NOT NULL,
  "seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "published_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_articles_slug_idx" ON "content_articles" ("slug");

CREATE TABLE IF NOT EXISTS "content_product_embeds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "article_id" uuid NOT NULL REFERENCES "content_articles"("id") ON DELETE cascade,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "position" integer NOT NULL,
  "variant" text DEFAULT 'inline' NOT NULL
);

CREATE TABLE IF NOT EXISTS "curated_collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "cover_image_url" text NOT NULL,
  "campaign_origin" text NOT NULL,
  "utm_defaults" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "cta_text" text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "curated_collections_slug_idx" ON "curated_collections" ("slug");

CREATE TABLE IF NOT EXISTS "collection_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "collection_id" uuid NOT NULL REFERENCES "curated_collections"("id") ON DELETE cascade,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_comparisons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "share_token" text NOT NULL UNIQUE,
  "session_id" text NOT NULL,
  "editorial_intro" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "comparison_products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "comparison_id" uuid NOT NULL REFERENCES "product_comparisons"("id") ON DELETE cascade,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "sort_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "marketplace" "marketplace" NOT NULL,
  "code" text NOT NULL,
  "description" text NOT NULL,
  "discount_value" numeric(12, 2) NOT NULL,
  "discount_type" "discount_type" NOT NULL,
  "valid_from" timestamp with time zone NOT NULL,
  "valid_until" timestamp with time zone NOT NULL,
  "status" "coupon_status" DEFAULT 'unverified' NOT NULL,
  "source_url" text NOT NULL,
  "last_verified_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "sync_job_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "job_type" "sync_job_type" NOT NULL,
  "status" "sync_job_status" NOT NULL,
  "items_processed" integer DEFAULT 0 NOT NULL,
  "errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "started_at" timestamp with time zone NOT NULL,
  "finished_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "click_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "origin" text NOT NULL,
  "session_id" text,
  "occurred_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "affiliate_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "marketplace" "marketplace" NOT NULL,
  "affiliate_tag" text NOT NULL,
  "status" text NOT NULL,
  "validated_by" text,
  "validated_at" timestamp with time zone
);
