ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "visible" boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "products_visible_idx" ON "products" ("visible");
