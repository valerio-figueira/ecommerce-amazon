import { describe, expect, it, vi } from 'vitest';

import {
  BlockType,
  EntityNotFoundError,
  PageBlock,
  PageLayout,
  PageStatus,
  ValidationError,
} from '@ecommerce-amazon/domain';

import {
  createMockPageCacheInvalidator,
  createMockPageRepository,
} from '../../test/mock-factories.js';
import { DeletePageBlock } from './DeletePageBlock.js';
import { SavePageBlock } from './SavePageBlock.js';
import { UpdatePageBlocksOrder } from './UpdatePageBlocksOrder.js';

const PAGE_ID = 'f1111111-1111-4111-8111-111111111111';
const BLOCK_A = 'f3111111-1111-4111-8111-111111111111';
const BLOCK_B = 'f4111111-1111-4111-8111-111111111111';

function mockPage() {
  return {
    layout: PageLayout.create({
      id: PAGE_ID,
      slug: 'home',
      title: 'Home',
      status: PageStatus.PUBLISHED,
      updatedAt: new Date(),
    }),
    blocks: [
      PageBlock.create({
        id: BLOCK_A,
        pageId: PAGE_ID,
        type: BlockType.SPACER,
        sortOrder: 0,
        props: { size: 'md' },
      }),
      PageBlock.create({
        id: BLOCK_B,
        pageId: PAGE_ID,
        type: BlockType.BANNER,
        sortOrder: 1,
        props: {
          imageUrl: 'https://example.com/banner.jpg',
          href: 'https://example.com',
          alt: 'Banner',
        },
      }),
    ],
  };
}

describe('SavePageBlock', () => {
  it('validates props with BlockPropsResolver and saves block', async () => {
    const pageRepository = createMockPageRepository({
      findPageById: vi.fn().mockResolvedValue(mockPage()),
      saveBlock: vi.fn(),
    });
    const pageCacheInvalidator = createMockPageCacheInvalidator();

    const useCase = new SavePageBlock(pageRepository, pageCacheInvalidator);
    const result = await useCase.execute({
      pageId: PAGE_ID,
      type: BlockType.DYNAMIC_PRODUCT_GRID,
      position: 2,
      props: {
        title: 'Ofertas dinâmicas',
        categoryVertical: 'home-office',
        limit: 6,
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.blockId).toBeDefined();
    }
    expect(pageRepository.saveBlock).toHaveBeenCalled();
    expect(pageCacheInvalidator.invalidateBySlug).toHaveBeenCalledWith('home');
  });

  it('returns ValidationError for invalid props', async () => {
    const pageRepository = createMockPageRepository({
      findPageById: vi.fn().mockResolvedValue(mockPage()),
    });
    const useCase = new SavePageBlock(pageRepository, createMockPageCacheInvalidator());

    const result = await useCase.execute({
      pageId: PAGE_ID,
      type: BlockType.DYNAMIC_PRODUCT_GRID,
      position: 0,
      props: { title: 'AB' },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });
});

describe('DeletePageBlock', () => {
  it('returns EntityNotFoundError when block is missing', async () => {
    const pageRepository = createMockPageRepository({
      findBlockById: vi.fn().mockResolvedValue(null),
    });
    const useCase = new DeletePageBlock(pageRepository, createMockPageCacheInvalidator());

    const result = await useCase.execute({ blockId: BLOCK_A });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(EntityNotFoundError);
    }
  });

  it('deletes block and invalidates cache', async () => {
    const pageRepository = createMockPageRepository({
      findBlockById: vi.fn().mockResolvedValue(
        PageBlock.create({
          id: BLOCK_A,
          pageId: PAGE_ID,
          type: BlockType.SPACER,
          sortOrder: 0,
          props: { size: 'md' },
        }),
      ),
      deleteBlock: vi.fn().mockResolvedValue({ pageId: PAGE_ID, pageSlug: 'home' }),
    });
    const pageCacheInvalidator = createMockPageCacheInvalidator();
    const useCase = new DeletePageBlock(pageRepository, pageCacheInvalidator);

    const result = await useCase.execute({ blockId: BLOCK_A });
    expect(result.ok).toBe(true);
    expect(pageCacheInvalidator.invalidateBySlug).toHaveBeenCalledWith('home');
  });
});

describe('UpdatePageBlocksOrder', () => {
  it('rejects non-contiguous positions', async () => {
    const pageRepository = createMockPageRepository({
      findPageById: vi.fn().mockResolvedValue(mockPage()),
    });
    const useCase = new UpdatePageBlocksOrder(pageRepository, createMockPageCacheInvalidator());

    const result = await useCase.execute({
      pageId: PAGE_ID,
      blocksOrder: [
        { blockId: BLOCK_A, position: 0 },
        { blockId: BLOCK_B, position: 2 },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('updates order and invalidates cache', async () => {
    const pageRepository = createMockPageRepository({
      findPageById: vi.fn().mockResolvedValue(mockPage()),
      updateBlocksOrder: vi.fn(),
    });
    const pageCacheInvalidator = createMockPageCacheInvalidator();
    const useCase = new UpdatePageBlocksOrder(pageRepository, pageCacheInvalidator);

    const result = await useCase.execute({
      pageId: PAGE_ID,
      blocksOrder: [
        { blockId: BLOCK_B, position: 0 },
        { blockId: BLOCK_A, position: 1 },
      ],
    });

    expect(result.ok).toBe(true);
    expect(pageRepository.updateBlocksOrder).toHaveBeenCalledWith(PAGE_ID, [
      { blockId: BLOCK_B, sortOrder: 0 },
      { blockId: BLOCK_A, sortOrder: 1 },
    ]);
    expect(pageCacheInvalidator.invalidateBySlug).toHaveBeenCalledWith('home');
  });
});
