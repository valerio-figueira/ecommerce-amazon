ALTER TABLE "auto_links"
  ADD COLUMN IF NOT EXISTS "apply_to" varchar(16) NOT NULL DEFAULT 'both';
