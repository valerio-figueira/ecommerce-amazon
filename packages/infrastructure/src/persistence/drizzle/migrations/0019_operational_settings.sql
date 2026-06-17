ALTER TABLE "affiliate_accounts" ADD COLUMN IF NOT EXISTS "validation_notes" text;

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" uuid PRIMARY KEY NOT NULL,
  "settings" jsonb NOT NULL,
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "updated_by" uuid REFERENCES "operators"("id") ON DELETE SET NULL
);
