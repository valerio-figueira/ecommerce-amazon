CREATE TABLE IF NOT EXISTS "content_clusters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "slug" varchar(150) NOT NULL,
  "description" text,
  "pilar_article_id" uuid,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "content_clusters_slug_idx" ON "content_clusters" ("slug");
CREATE INDEX IF NOT EXISTS "content_clusters_pilar_article_id_idx" ON "content_clusters" ("pilar_article_id");

ALTER TABLE "content_articles"
  ADD COLUMN IF NOT EXISTS "cluster_id" uuid;

DO $$ BEGIN
  ALTER TABLE "content_articles"
    ADD CONSTRAINT "content_articles_cluster_id_content_clusters_id_fk"
    FOREIGN KEY ("cluster_id") REFERENCES "content_clusters"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "content_clusters"
    ADD CONSTRAINT "content_clusters_pilar_article_id_content_articles_id_fk"
    FOREIGN KEY ("pilar_article_id") REFERENCES "content_articles"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "content_articles_cluster_id_idx" ON "content_articles" ("cluster_id");
