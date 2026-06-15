import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const contentClusters = pgTable(
  'content_clusters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 120 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull().unique(),
    description: text('description'),
    /** FK to content_articles enforced in migration (circular reference). */
    pilarArticleId: uuid('pilar_article_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('content_clusters_pilar_article_id_idx').on(table.pilarArticleId)],
);
