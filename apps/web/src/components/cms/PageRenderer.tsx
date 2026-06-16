import { BlockType } from '@ecommerce-amazon/domain';
import type { PageBlockDeliveryDto, PageLayoutDeliveryDto } from '@ecommerce-amazon/shared/cms';
import { categoryPillsPropsSchema, heroSplitPropsSchema } from '@ecommerce-amazon/shared/cms';

import { BlockErrorBoundary } from '@/components/errors/BlockErrorBoundary';
import { CategoryFilterProvider } from '@/components/cms/CategoryFilterContext';
import { BlockRegistry } from '@/components/cms/BlockRegistry';

type PageRendererProps = {
  layout: PageLayoutDeliveryDto;
};

function collectHiddenBlockIds(blocks: PageBlockDeliveryDto[]): Set<string> {
  const hidden = new Set<string>();
  for (const block of blocks) {
    if (block.type === BlockType.HERO_SPLIT) {
      const parsed = heroSplitPropsSchema.safeParse(block.props);
      if (parsed.success) {
        hidden.add(parsed.data.leftBlockId);
        hidden.add(parsed.data.rightBlockId);
      }
    }
    if (block.type === BlockType.CATEGORY_PILLS) {
      const parsed = categoryPillsPropsSchema.safeParse(block.props);
      if (parsed.success && parsed.data.linkedBlockId) {
        hidden.add(block.id);
      }
    }
  }
  return hidden;
}

function buildBlocksById(blocks: PageBlockDeliveryDto[]): Record<string, PageBlockDeliveryDto> {
  return Object.fromEntries(blocks.map((block) => [block.id, block]));
}

export function PageRenderer({ layout }: PageRendererProps): React.JSX.Element {
  const blocksById = buildBlocksById(layout.blocks);
  const hiddenIds = collectHiddenBlockIds(layout.blocks);
  const topLevel = [...layout.blocks]
    .filter((block) => !hiddenIds.has(block.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <CategoryFilterProvider>
      <div className="space-y-10">
        {topLevel.map((block, index) => {
          const Component = BlockRegistry[block.type];
          if (!Component) return null;
          return (
            <BlockErrorBoundary key={block.id} blockId={block.id} blockType={block.type}>
              <Component block={block} blocksById={blocksById} isFirstBlock={index === 0} />
            </BlockErrorBoundary>
          );
        })}
      </div>
    </CategoryFilterProvider>
  );
}
