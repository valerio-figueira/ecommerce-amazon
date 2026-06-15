ALTER TABLE click_events
  ADD COLUMN article_id uuid REFERENCES content_articles(id) ON DELETE SET NULL;

CREATE INDEX click_events_occurred_at_idx ON click_events (occurred_at DESC);
CREATE INDEX click_events_product_occurred_idx ON click_events (product_id, occurred_at DESC);
CREATE INDEX click_events_origin_occurred_idx ON click_events (origin, occurred_at DESC);
CREATE INDEX click_events_article_id_idx ON click_events (article_id) WHERE article_id IS NOT NULL;
