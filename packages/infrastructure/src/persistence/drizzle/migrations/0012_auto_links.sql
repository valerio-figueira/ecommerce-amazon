CREATE TABLE IF NOT EXISTS "auto_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "keyword" varchar(120) NOT NULL,
  "target_url" varchar(255) NOT NULL,
  "max_matches" integer NOT NULL DEFAULT 1,
  "priority" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "auto_links_active_priority_idx"
  ON "auto_links" ("is_active", "priority");
