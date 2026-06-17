CREATE TABLE IF NOT EXISTS "marketplace_api_credentials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "marketplace" "marketplace" NOT NULL,
  "auth_type" text NOT NULL,
  "credentials_encrypted" text NOT NULL,
  "public_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "health_status" text DEFAULT 'not_configured' NOT NULL,
  "health_message" text,
  "last_health_check_at" timestamp with time zone,
  "last_used_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_by" uuid,
  CONSTRAINT "marketplace_api_credentials_marketplace_unique" UNIQUE("marketplace")
);

ALTER TABLE "marketplace_api_credentials"
  ADD CONSTRAINT "marketplace_api_credentials_updated_by_operators_id_fk"
  FOREIGN KEY ("updated_by") REFERENCES "public"."operators"("id") ON DELETE set null ON UPDATE no action;
