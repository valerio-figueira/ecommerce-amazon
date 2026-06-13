CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "label" text NOT NULL,
  "icon" varchar(50),
  "parent_id" uuid,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "seo_title" varchar(150),
  "seo_description" text,
  "description_html" text,
  "amazon_browse_node" varchar(50),
  "mercadolivre_category_id" varchar(50),
  "shopee_category_id" varchar(50),
  "visible" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" ("slug");
CREATE INDEX "categories_parent_sort_idx" ON "categories" ("parent_id", "sort_order");
CREATE INDEX "categories_parent_id_idx" ON "categories" ("parent_id");

ALTER TABLE "categories"
  ADD CONSTRAINT "category_parent_id_fk"
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL;

INSERT INTO "categories" ("id", "slug", "label", "sort_order", "visible") VALUES
  ('a0111111-1111-4111-8111-111111111111', 'home-office', 'Home Office', 0, true),
  ('a0222222-2222-4222-8222-222222222222', 'games', 'Games', 1, true),
  ('a0333333-3333-4333-8333-333333333333', 'eletronicos', 'Eletrônicos', 2, true);

ALTER TABLE "products" ADD COLUMN "category_id" uuid;

UPDATE "products" p
SET "category_id" = c."id"
FROM "categories" c
WHERE p."category_vertical" = c."slug";

ALTER TABLE "products"
  ADD CONSTRAINT "products_category_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;

CREATE INDEX "products_category_id_idx" ON "products" ("category_id");

ALTER TABLE "products" DROP COLUMN "category_vertical";
