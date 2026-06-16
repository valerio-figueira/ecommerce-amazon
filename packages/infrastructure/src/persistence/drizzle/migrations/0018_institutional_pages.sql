DO $$ BEGIN
  CREATE TYPE "page_kind" AS ENUM ('block_layout', 'institutional');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "pages"
  ADD COLUMN IF NOT EXISTS "page_kind" "page_kind" NOT NULL DEFAULT 'block_layout',
  ADD COLUMN IF NOT EXISTS "institutional_content" jsonb;
