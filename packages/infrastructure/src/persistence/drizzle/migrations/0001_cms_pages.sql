-- CMS pages and blocks
CREATE TYPE "public"."page_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."block_visibility" AS ENUM('all', 'desktop', 'mobile');
CREATE TYPE "public"."block_type" AS ENUM(
  'hero_carousel',
  'featured_product',
  'product_grid',
  'category_pills',
  'hero_split',
  'curated_collection',
  'coupon_strip',
  'rich_text',
  'banner',
  'spacer'
);

CREATE TABLE IF NOT EXISTS "pages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "status" "page_status" DEFAULT 'draft' NOT NULL,
  "seo_title" text,
  "seo_description" text,
  "published_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_status_idx" ON "pages" ("slug", "status");

CREATE TABLE IF NOT EXISTS "page_blocks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "page_id" uuid NOT NULL REFERENCES "pages"("id") ON DELETE cascade,
  "type" "block_type" NOT NULL,
  "sort_order" integer NOT NULL,
  "props" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "visibility" "block_visibility" DEFAULT 'all' NOT NULL
);

CREATE INDEX IF NOT EXISTS "page_blocks_page_sort_idx" ON "page_blocks" ("page_id", "sort_order");
