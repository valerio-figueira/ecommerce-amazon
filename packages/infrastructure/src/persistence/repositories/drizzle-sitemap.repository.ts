import { sql } from 'drizzle-orm';

import type { SitemapEntryRecord, SitemapRepository } from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';

const SITEMAP_ENTRIES_SQL = sql`
  SELECT path, last_modified FROM (
    SELECT '/'::text AS path, NOW() AS last_modified
    UNION ALL
    SELECT '/artigos'::text, NOW()
    UNION ALL
    SELECT '/legal'::text, NOW()
    UNION ALL
    SELECT '/sobre'::text, NOW()
    UNION ALL
    SELECT '/contato'::text, NOW()
    UNION ALL
    SELECT '/categorias/' || slug, updated_at
    FROM categories
    WHERE visible = true
    UNION ALL
    SELECT '/colecoes/' || slug, updated_at
    FROM curated_collections
    UNION ALL
    SELECT '/comparar/' || slug, COALESCE(published_at, updated_at)
    FROM product_comparisons
    WHERE status = 'published' AND slug IS NOT NULL
    UNION ALL
    SELECT '/artigos/' || slug, updated_at
    FROM content_articles
    WHERE status = 'published'
    UNION ALL
    SELECT '/produtos/' || slug, created_at
    FROM products
    WHERE visible = true
  ) AS sitemap_entries
`;

export class DrizzleSitemapRepository implements SitemapRepository {
  constructor(private readonly db: DrizzleClient) {}

  async countEntries(): Promise<number> {
    const result = await this.db.execute<{ count: string }>(sql`
      SELECT COUNT(*)::text AS count FROM (${SITEMAP_ENTRIES_SQL}) AS counted
    `);
    const row = result[0];
    return row ? Number(row.count) : 0;
  }

  async listEntries(offset: number, limit: number): Promise<SitemapEntryRecord[]> {
    const result = await this.db.execute<{ path: string; last_modified: Date | string }>(sql`
      SELECT path, last_modified
      FROM (${SITEMAP_ENTRIES_SQL}) AS entries
      ORDER BY path ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    return result.map((row) => ({
      path: row.path,
      lastModified:
        row.last_modified instanceof Date ? row.last_modified : new Date(row.last_modified),
    }));
  }
}
