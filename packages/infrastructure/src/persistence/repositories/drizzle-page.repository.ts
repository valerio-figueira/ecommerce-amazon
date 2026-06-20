import { and, asc, eq, gte, inArray, sql } from 'drizzle-orm';

import {
  BlockType,
  BlockVisibility,
  EntityNotFoundError,
  PageBlock,
  PageKind,
  PageLayout,
  PageStatus,
  parseBlockType,
  parseBlockVisibility,
  parsePageKind,
  parsePageStatus,
  type AdminPageSummary,
  type InstitutionalPageResult,
  type PageRepository,
  type PublishedPageResult,
  type PageWithBlocksResult,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function mapPageRow(row: typeof schema.pages.$inferSelect): PageLayout {
  return PageLayout.create({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: parsePageStatus(row.status),
    pageKind: parsePageKind(row.pageKind),
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    institutionalContent: row.institutionalContent ?? undefined,
    publishedAt: row.publishedAt ?? undefined,
    updatedAt: row.updatedAt,
  });
}

function mapBlockRow(row: typeof schema.pageBlocks.$inferSelect): PageBlock {
  return PageBlock.create({
    id: row.id,
    pageId: row.pageId,
    type: parseBlockType(row.type),
    sortOrder: row.sortOrder,
    props: row.props,
    visibility: parseBlockVisibility(row.visibility),
  });
}

export class DrizzlePageRepository implements PageRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findPublishedBySlug(slug: string): Promise<PublishedPageResult | null> {
    const pageRows = await this.db
      .select()
      .from(schema.pages)
      .where(and(eq(schema.pages.slug, slug), eq(schema.pages.status, PageStatus.PUBLISHED)))
      .limit(1);

    const pageRow = pageRows[0];
    if (!pageRow) return null;

    return this.loadBlocksForPage(pageRow);
  }

  async findPageBySlug(slug: string): Promise<PageWithBlocksResult | null> {
    const pageRows = await this.db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, slug))
      .limit(1);

    const pageRow = pageRows[0];
    if (!pageRow) return null;

    return this.loadBlocksForPage(pageRow);
  }

  async listPages(): Promise<AdminPageSummary[]> {
    const rows = await this.db
      .select({
        id: schema.pages.id,
        slug: schema.pages.slug,
        title: schema.pages.title,
        status: schema.pages.status,
        pageKind: schema.pages.pageKind,
      })
      .from(schema.pages)
      .orderBy(asc(schema.pages.slug));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: parsePageStatus(row.status),
      pageKind: parsePageKind(row.pageKind),
    }));
  }

  async findPublishedInstitutionalBySlug(slug: string): Promise<InstitutionalPageResult | null> {
    const pageRows = await this.db
      .select()
      .from(schema.pages)
      .where(
        and(
          eq(schema.pages.slug, slug),
          eq(schema.pages.status, PageStatus.PUBLISHED),
          eq(schema.pages.pageKind, PageKind.INSTITUTIONAL),
        ),
      )
      .limit(1);

    const pageRow = pageRows[0];
    if (!pageRow) return null;

    return { layout: mapPageRow(pageRow) };
  }

  async findInstitutionalBySlug(slug: string): Promise<InstitutionalPageResult | null> {
    const pageRows = await this.db
      .select()
      .from(schema.pages)
      .where(and(eq(schema.pages.slug, slug), eq(schema.pages.pageKind, PageKind.INSTITUTIONAL)))
      .limit(1);

    const pageRow = pageRows[0];
    if (!pageRow) return null;

    return { layout: mapPageRow(pageRow) };
  }

  async updateInstitutionalContent(
    pageId: string,
    payload: {
      content: Record<string, unknown>;
      seoTitle?: string | null;
      seoDescription?: string | null;
      status?: PageStatus;
      publishedAt?: Date;
    },
  ): Promise<InstitutionalPageResult> {
    const rows = await this.db
      .update(schema.pages)
      .set({
        institutionalContent: payload.content,
        ...(payload.seoTitle !== undefined ? { seoTitle: payload.seoTitle } : {}),
        ...(payload.seoDescription !== undefined ? { seoDescription: payload.seoDescription } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.publishedAt !== undefined ? { publishedAt: payload.publishedAt } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(schema.pages.id, pageId), eq(schema.pages.pageKind, PageKind.INSTITUTIONAL)))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('InstitutionalPage', pageId);
    }

    return { layout: mapPageRow(row) };
  }

  async findPageById(pageId: string): Promise<PageWithBlocksResult | null> {
    const pageRows = await this.db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.id, pageId))
      .limit(1);

    const pageRow = pageRows[0];
    if (!pageRow) return null;

    return this.loadBlocksForPage(pageRow);
  }

  async findBlockById(blockId: string): Promise<PageBlock | null> {
    const rows = await this.db
      .select()
      .from(schema.pageBlocks)
      .where(eq(schema.pageBlocks.id, blockId))
      .limit(1);

    const row = rows[0];
    return row ? mapBlockRow(row) : null;
  }

  async updateBlocksOrder(
    pageId: string,
    orders: Array<{ blockId: string; sortOrder: number }>,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const blockIds = orders.map((o) => o.blockId);
      const existing = await tx
        .select({ id: schema.pageBlocks.id })
        .from(schema.pageBlocks)
        .where(and(eq(schema.pageBlocks.pageId, pageId), inArray(schema.pageBlocks.id, blockIds)));

      if (existing.length !== orders.length) {
        throw new Error('One or more blocks do not belong to this page');
      }

      for (const order of orders) {
        await tx
          .update(schema.pageBlocks)
          .set({ sortOrder: order.sortOrder })
          .where(
            and(eq(schema.pageBlocks.id, order.blockId), eq(schema.pageBlocks.pageId, pageId)),
          );
      }
    });
  }

  async saveBlock(block: PageBlock): Promise<void> {
    await this.db
      .insert(schema.pageBlocks)
      .values({
        id: block.id,
        pageId: block.pageId,
        type: block.type,
        sortOrder: block.sortOrder,
        props: block.props,
        visibility: block.visibility,
      })
      .onConflictDoUpdate({
        target: schema.pageBlocks.id,
        set: {
          type: block.type,
          sortOrder: block.sortOrder,
          props: block.props,
          visibility: block.visibility,
        },
      });
  }

  async insertBlockAtPosition(block: PageBlock): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.pageBlocks)
        .set({ sortOrder: sql`${schema.pageBlocks.sortOrder} + 1` })
        .where(
          and(
            eq(schema.pageBlocks.pageId, block.pageId),
            gte(schema.pageBlocks.sortOrder, block.sortOrder),
          ),
        );

      await tx.insert(schema.pageBlocks).values({
        id: block.id,
        pageId: block.pageId,
        type: block.type,
        sortOrder: block.sortOrder,
        props: block.props,
        visibility: block.visibility,
      });
    });
  }

  async deleteBlock(blockId: string): Promise<{ pageId: string; pageSlug: string }> {
    return this.db.transaction(async (tx) => {
      const blockRows = await tx
        .select()
        .from(schema.pageBlocks)
        .where(eq(schema.pageBlocks.id, blockId))
        .limit(1);

      const blockRow = blockRows[0];
      if (!blockRow) {
        throw new Error(`Block not found: ${blockId}`);
      }

      const pageRows = await tx
        .select()
        .from(schema.pages)
        .where(eq(schema.pages.id, blockRow.pageId))
        .limit(1);

      const pageRow = pageRows[0];
      if (!pageRow) {
        throw new Error(`Page not found for block: ${blockId}`);
      }

      await tx.delete(schema.pageBlocks).where(eq(schema.pageBlocks.id, blockId));

      const remaining = await tx
        .select()
        .from(schema.pageBlocks)
        .where(eq(schema.pageBlocks.pageId, blockRow.pageId))
        .orderBy(asc(schema.pageBlocks.sortOrder));

      for (let index = 0; index < remaining.length; index++) {
        const row = remaining[index];
        if (!row || row.sortOrder === index) continue;
        await tx
          .update(schema.pageBlocks)
          .set({ sortOrder: index })
          .where(eq(schema.pageBlocks.id, row.id));
      }

      return { pageId: pageRow.id, pageSlug: pageRow.slug };
    });
  }

  private async loadBlocksForPage(
    pageRow: typeof schema.pages.$inferSelect,
  ): Promise<PublishedPageResult> {
    const blockRows = await this.db
      .select()
      .from(schema.pageBlocks)
      .where(eq(schema.pageBlocks.pageId, pageRow.id))
      .orderBy(asc(schema.pageBlocks.sortOrder));

    return {
      layout: mapPageRow(pageRow),
      blocks: blockRows.map(mapBlockRow),
    };
  }
}

export async function insertPageWithBlocks(
  db: DrizzleClient,
  page: {
    id: string;
    slug: string;
    title: string;
    status: PageStatus;
    seoTitle?: string;
    seoDescription?: string;
    publishedAt?: Date;
    updatedAt: Date;
  },
  blocks: Array<{
    id: string;
    type: BlockType;
    sortOrder: number;
    props: Record<string, unknown>;
    visibility?: BlockVisibility;
  }>,
): Promise<void> {
  await db.insert(schema.pages).values({
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: page.status,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  });

  if (blocks.length > 0) {
    await db.insert(schema.pageBlocks).values(
      blocks.map((block) => ({
        id: block.id,
        pageId: page.id,
        type: block.type,
        sortOrder: block.sortOrder,
        props: block.props,
        visibility: block.visibility ?? BlockVisibility.ALL,
      })),
    );
  }
}
