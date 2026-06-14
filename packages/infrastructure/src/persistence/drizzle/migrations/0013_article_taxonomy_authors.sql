DO $$ BEGIN
 CREATE TYPE "operator_role" AS ENUM('admin', 'editor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "article_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "slug" varchar(100) NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "article_categories_slug_idx" ON "article_categories" ("slug");

ALTER TABLE "operators"
  ADD COLUMN IF NOT EXISTS "avatar_url" text,
  ADD COLUMN IF NOT EXISTS "bio" varchar(250),
  ADD COLUMN IF NOT EXISTS "role" "operator_role" NOT NULL DEFAULT 'admin';

ALTER TABLE "content_articles"
  ADD COLUMN IF NOT EXISTS "category_id" uuid REFERENCES "article_categories"("id") ON DELETE SET NULL;

DO $$ BEGIN
 ALTER TABLE "content_articles" ADD CONSTRAINT "content_articles_author_id_operators_id_fk" FOREIGN KEY ("author_id") REFERENCES "operators"("id") ON DELETE SET NULL;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
