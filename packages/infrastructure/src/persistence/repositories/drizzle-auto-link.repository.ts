import { asc, and, count, eq, ne } from 'drizzle-orm';

import { AutoLink, type AutoLinkRepository } from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function mapAutoLinkRow(row: typeof schema.autoLinks.$inferSelect): AutoLink {
  return AutoLink.create({
    id: row.id,
    keyword: row.keyword,
    targetUrl: row.targetUrl,
    maxMatches: row.maxMatches,
    priority: row.priority,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleAutoLinkRepository implements AutoLinkRepository {
  constructor(private readonly db: DrizzleClient) {}

  async listActive(): Promise<AutoLink[]> {
    const rows = await this.db
      .select()
      .from(schema.autoLinks)
      .where(eq(schema.autoLinks.isActive, true))
      .orderBy(asc(schema.autoLinks.priority), asc(schema.autoLinks.keyword));

    return rows.map(mapAutoLinkRow);
  }
}
