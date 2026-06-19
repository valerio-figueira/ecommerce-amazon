CREATE TYPE "comparison_status" AS ENUM ('draft', 'published');
CREATE TYPE "comparison_source" AS ENUM ('user_generated', 'curated');

ALTER TABLE "product_comparisons" ADD COLUMN "slug" text;
ALTER TABLE "product_comparisons" ADD COLUMN "status" "comparison_status" DEFAULT 'draft' NOT NULL;
ALTER TABLE "product_comparisons" ADD COLUMN "source" "comparison_source" DEFAULT 'user_generated' NOT NULL;
ALTER TABLE "product_comparisons" ADD COLUMN "seo_title" text;
ALTER TABLE "product_comparisons" ADD COLUMN "seo_description" text;
ALTER TABLE "product_comparisons" ADD COLUMN "show_category_carousel" boolean DEFAULT true NOT NULL;
ALTER TABLE "product_comparisons" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "product_comparisons" ADD COLUMN "published_at" timestamp with time zone;

CREATE UNIQUE INDEX "product_comparisons_slug_idx" ON "product_comparisons" ("slug");
CREATE INDEX "product_comparisons_status_idx" ON "product_comparisons" ("status");

UPDATE "product_comparisons"
SET
  "status" = 'draft',
  "source" = 'user_generated',
  "updated_at" = COALESCE("created_at", now())
WHERE "status" IS NULL OR "source" IS NULL OR "updated_at" IS NULL;
