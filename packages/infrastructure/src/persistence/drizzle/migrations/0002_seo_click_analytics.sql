ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "canonical_url" varchar(512);

ALTER TABLE "click_events" ADD COLUMN IF NOT EXISTS "block_id" uuid;

DO $$ BEGIN
 ALTER TABLE "click_events" ADD CONSTRAINT "click_events_block_id_page_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."page_blocks"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "click_events_block_id_idx" ON "click_events" USING btree ("block_id");
