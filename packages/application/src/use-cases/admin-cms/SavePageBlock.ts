import { randomUUID } from 'node:crypto';

import {
  BlockVisibility,
  EntityNotFoundError,
  PageBlock,
  ValidationError,
  type BlockType,
  type PageCacheInvalidator,
  type PageRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';
import { parseBlockProps } from '@ecommerce-amazon/shared/cms';
import { ZodError } from 'zod';

import { buildCmsPageRevalidationOptions } from '../../cache/public-cache.helpers.js';

export class SavePageBlock {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageCacheInvalidator: PageCacheInvalidator,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: {
    pageId: string;
    blockId?: string | undefined;
    type: BlockType;
    position: number;
    props: unknown;
    visibility?: BlockVisibility | undefined;
  }): Promise<Result<{ blockId: string }, ValidationError | EntityNotFoundError>> {
    const page = await this.pageRepository.findPageById(input.pageId);
    if (!page) {
      return err(new EntityNotFoundError('Page', input.pageId));
    }

    const isUpdate = input.blockId !== undefined;
    let existingVisibility: BlockVisibility | undefined;

    if (isUpdate) {
      const existingBlockId = input.blockId;
      if (!existingBlockId) {
        return err(new ValidationError('blockId is required for update'));
      }
      const existing = await this.pageRepository.findBlockById(existingBlockId);
      if (!existing || existing.pageId !== input.pageId) {
        return err(new EntityNotFoundError('PageBlock', existingBlockId));
      }
      existingVisibility = existing.visibility;
    }

    let parsedProps: Record<string, unknown>;
    try {
      parsedProps = parseBlockProps(input.type, input.props);
    } catch (error) {
      if (error instanceof ZodError) {
        return err(new ValidationError(error.message));
      }
      throw error;
    }

    const blockId = input.blockId ?? randomUUID();
    const visibility = input.visibility ?? existingVisibility ?? BlockVisibility.ALL;

    const block = PageBlock.create({
      id: blockId,
      pageId: input.pageId,
      type: input.type,
      sortOrder: input.position,
      props: parsedProps,
      visibility,
    });

    if (isUpdate) {
      await this.pageRepository.saveBlock(block);
    } else {
      await this.pageRepository.insertBlockAtPosition(block);
    }

    await this.pageCacheInvalidator.invalidateBySlug(page.layout.slug);
    await this.webRevalidator.revalidate(buildCmsPageRevalidationOptions(page.layout.slug));

    return ok({ blockId });
  }
}
