import type { PageBlock } from '../entities/PageBlock.js';
import type { PageLayout } from '../entities/PageLayout.js';

export type PublishedPageResult = {
  layout: PageLayout;
  blocks: PageBlock[];
};

export interface PageRepository {
  findPublishedBySlug(slug: string): Promise<PublishedPageResult | null>;
}
