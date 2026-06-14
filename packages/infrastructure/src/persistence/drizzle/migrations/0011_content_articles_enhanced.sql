ALTER TABLE "content_articles"
  ADD COLUMN IF NOT EXISTS "excerpt" text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "cover_image_url" varchar(255),
  ADD COLUMN IF NOT EXISTS "author_id" uuid REFERENCES "operators"("id"),
  ADD COLUMN IF NOT EXISTS "seo_title" text,
  ADD COLUMN IF NOT EXISTS "seo_description" text,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

UPDATE "content_articles"
SET
  "seo_title" = COALESCE("seo_title", "seo"->>'metaTitle', "seo"->>'title'),
  "seo_description" = COALESCE("seo_description", "seo"->>'metaDescription', "seo"->>'description'),
  "created_at" = COALESCE("published_at", now()),
  "updated_at" = COALESCE("published_at", now())
WHERE "seo_title" IS NULL OR "seo_description" IS NULL;
