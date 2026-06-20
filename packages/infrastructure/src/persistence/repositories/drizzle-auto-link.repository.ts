import { count, desc, eq, ilike, or, sql } from 'drizzle-orm';

import {
  AutoLink,
  normalizeAutoLinkKeyword,
  type AutoLinkRepository,
} from '@ecommerce-amazon/domain';

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

  async save(autoLink: AutoLink): Promise<void> {
    await this.db
      .insert(schema.autoLinks)
      .values({
        id: autoLink.id,
        keyword: autoLink.keyword,
        targetUrl: autoLink.targetUrl,
        maxMatches: autoLink.maxMatches,
        priority: autoLink.priority,
        isActive: autoLink.isActive,
        createdAt: autoLink.createdAt,
        updatedAt: autoLink.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.autoLinks.id,
        set: {
          keyword: autoLink.keyword,
          targetUrl: autoLink.targetUrl,
          maxMatches: autoLink.maxMatches,
          priority: autoLink.priority,
          isActive: autoLink.isActive,
          updatedAt: autoLink.updatedAt,
        },
      });
  }

  async findById(id: string): Promise<AutoLink | null> {
    const rows = await this.db
      .select()
      .from(schema.autoLinks)
      .where(eq(schema.autoLinks.id, id))
      .limit(1);

    const row = rows[0];
    return row ? mapAutoLinkRow(row) : null;
  }

  async findByKeywordNormalized(keyword: string): Promise<AutoLink | null> {
    const normalized = normalizeAutoLinkKeyword(keyword);
    const rows = await this.db
      .select()
      .from(schema.autoLinks)
      .where(sql`lower(trim(${schema.autoLinks.keyword})) = ${normalized}`)
      .limit(1);

    const row = rows[0];
    return row ? mapAutoLinkRow(row) : null;
  }

  async findAllActiveSortedByPriority(): Promise<AutoLink[]> {
    const rows = await this.db
      .select()
      .from(schema.autoLinks)
      .where(eq(schema.autoLinks.isActive, true))
      .orderBy(desc(schema.autoLinks.priority), desc(sql`length(${schema.autoLinks.keyword})`));

    return rows.map(mapAutoLinkRow);
  }

  async listPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: AutoLink[]; total: number }> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const offset = (page - 1) * limit;

    const searchTerm = params.search?.trim();
    const whereClause = searchTerm
      ? or(
          ilike(schema.autoLinks.keyword, `%${searchTerm}%`),
          ilike(schema.autoLinks.targetUrl, `%${searchTerm}%`),
        )
      : undefined;

    const [rows, totalRows] = await Promise.all([
      this.db
        .select()
        .from(schema.autoLinks)
        .where(whereClause)
        .orderBy(desc(schema.autoLinks.priority), desc(schema.autoLinks.updatedAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(schema.autoLinks).where(whereClause),
    ]);

    return {
      items: rows.map(mapAutoLinkRow),
      total: Number(totalRows[0]?.count ?? 0),
    };
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.autoLinks).where(eq(schema.autoLinks.id, id));
  }
}
