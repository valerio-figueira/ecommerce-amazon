DO $$ BEGIN
  CREATE TYPE "team_public_role" AS ENUM ('founder', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "operators"
  ADD COLUMN IF NOT EXISTS "job_title" varchar(120),
  ADD COLUMN IF NOT EXISTS "social_links" jsonb,
  ADD COLUMN IF NOT EXISTS "show_on_team" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "team_sort_order" smallint,
  ADD COLUMN IF NOT EXISTS "team_public_role" "team_public_role" DEFAULT 'member';
