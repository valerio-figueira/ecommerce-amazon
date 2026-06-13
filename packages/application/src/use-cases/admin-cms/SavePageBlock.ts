import { randomUUID } from 'node:crypto';

import {
  BlockType,
  BlockVisibility,
  EntityNotFoundError,
  PageBlock,
  ValidationError,
  type PageCacheInvalidator,
  type PageRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';
import { parseBlockProps } from '@ecommerce-amazon/shared/cms';
import { ZodError } from 'zod';

export class SavePageBlock {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageCacheInvalidator: PageCacheInvalidator,
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

    let parsedProps: Record<string, unknown>;
    try {
      parsedProps = parseBlockProps(input.type, input.props) as Record<string, unknown>;
    } catch (error) {
      if (error instanceof ZodError) {
        return err(new ValidationError(error.message));
      }
      throw error;
    }

    const blockId = input.blockId ?? randomUUID();
    const block = PageBlock.create({
      id: blockId,
      pageId: input.pageId,
      type: input.type,
      sortOrder: input.position,
      props: parsedProps,
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
    });

    await this.pageRepository.saveBlock(block);
    await this.pageCacheInvalidator.invalidateBySlug(page.layout.slug);

    return ok({ blockId });
  }
}
