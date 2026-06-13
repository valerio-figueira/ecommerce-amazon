import type { PageBlockDto } from '@ecommerce-amazon/shared/cms';

export type AdminBlock = PageBlockDto & {
  position: number;
};

export function toAdminBlocks(blocks: PageBlockDto[]): AdminBlock[] {
  return normalizePositions(
    blocks.map((block) => ({
      ...block,
      position: block.sortOrder,
    })),
  );
}

export function normalizePositions<T extends { position: number }>(list: T[]): T[] {
  return [...list]
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }));
}

export function adminBlocksToDto(blocks: AdminBlock[]): PageBlockDto[] {
  return blocks.map(({ position, ...block }) => ({
    ...block,
    sortOrder: position,
  }));
}
