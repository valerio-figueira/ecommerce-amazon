ALTER TABLE "click_events"
  ADD COLUMN "placement" text,
  ADD COLUMN "page_path" text,
  ADD COLUMN "referrer_path" text,
  ADD COLUMN "collection_id" uuid REFERENCES "curated_collections"("id") ON DELETE SET NULL;

CREATE INDEX "click_events_placement_occurred_idx" ON "click_events" ("placement", "occurred_at" DESC);
CREATE INDEX "click_events_page_path_occurred_idx" ON "click_events" ("page_path", "occurred_at" DESC);
CREATE INDEX "click_events_collection_id_occurred_idx" ON "click_events" ("collection_id", "occurred_at" DESC);

CREATE TABLE "content_engagement_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" text NOT NULL,
  "article_id" uuid REFERENCES "content_articles"("id") ON DELETE SET NULL,
  "page_path" text NOT NULL,
  "placement" text,
  "block_id" uuid REFERENCES "page_blocks"("id") ON DELETE SET NULL,
  "referrer_path" text,
  "session_id" text,
  "occurred_at" timestamp with time zone NOT NULL
);

CREATE INDEX "content_engagement_events_type_occurred_idx" ON "content_engagement_events" ("event_type", "occurred_at" DESC);
CREATE INDEX "content_engagement_events_article_occurred_idx" ON "content_engagement_events" ("article_id", "occurred_at" DESC);
