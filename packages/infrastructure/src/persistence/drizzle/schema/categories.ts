import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    label: text('label').notNull(),
    icon: varchar('icon', { length: 50 }),
    parentId: uuid('parent_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    seoTitle: varchar('seo_title', { length: 150 }),
    seoDescription: text('seo_description'),
    descriptionHtml: text('description_html'),
    amazonBrowseNode: varchar('amazon_browse_node', { length: 50 }),
    mercadolivreCategoryId: varchar('mercadolivre_category_id', { length: 50 }),
    shopeeCategoryId: varchar('shopee_category_id', { length: 50 }),
    visible: boolean('visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('categories_slug_idx').on(table.slug),
    index('categories_parent_sort_idx').on(table.parentId, table.sortOrder),
    index('categories_parent_id_idx').on(table.parentId),
  ],
);
