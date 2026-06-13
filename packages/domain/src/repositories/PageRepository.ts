import type { PageBlock } from '../entities/PageBlock.js';
import type { PageLayout } from '../entities/PageLayout.js';

export type PublishedPageResult = {
  layout: PageLayout;
  blocks: PageBlock[];
};

export type PageWithBlocksResult = {
  layout: PageLayout;
  blocks: PageBlock[];
};

export type AdminPageSummary = {
  id: string;
  slug: string;
  title: string;
  status: PageLayout['status'];
};

export interface PageRepository {
  findPublishedBySlug(slug: string): Promise<PublishedPageResult | null>;
  findPageBySlug(slug: string): Promise<PageWithBlocksResult | null>;
  findPageById(pageId: string): Promise<PageWithBlocksResult | null>;
  listPages(): Promise<AdminPageSummary[]>;
  findBlockById(blockId: string): Promise<PageBlock | null>;
  updateBlocksOrder(
    pageId: string,
    orders: Array<{ blockId: string; sortOrder: number }>,
  ): Promise<void>;
  saveBlock(block: PageBlock): Promise<void>;
  insertBlockAtPosition(block: PageBlock): Promise<void>;
  deleteBlock(blockId: string): Promise<{ pageId: string; pageSlug: string }>;
}
