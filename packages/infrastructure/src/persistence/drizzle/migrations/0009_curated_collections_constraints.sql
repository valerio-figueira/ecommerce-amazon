ALTER TABLE "curated_collections"
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE "collection_products"
    ADD CONSTRAINT "collection_products_collection_product_idx"
    UNIQUE ("collection_id", "product_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
