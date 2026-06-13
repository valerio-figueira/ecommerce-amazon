import { and, asc, eq } from 'drizzle-orm';

import {
  BlockType,
  BlockVisibility,
  PageBlock,
  PageLayout,
  PageStatus,
  parseBlockType,
  parseBlockVisibility,
  parsePageStatus,
  type PageRepository,
  type PublishedPageResult,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function mapPageRow(row: typeof schema.pages.$inferSelect): PageLayout {
  return PageLayout.create({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: parsePageStatus(row.status),
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
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
