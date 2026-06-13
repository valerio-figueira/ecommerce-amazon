'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import type { PageBlockDto, PageLayoutDto } from '@ecommerce-amazon/shared/cms';
import { categoryPillsPropsSchema, heroSplitPropsSchema } from '@ecommerce-amazon/shared/cms';

import { CategoryFilterProvider } from '@/components/cms/CategoryFilterContext';
import { BlockRegistry } from '@/components/cms/BlockRegistry';

type PageRendererProps = {
  layout: PageLayoutDto;
};

function collectHiddenBlockIds(blocks: PageBlockDto[]): Set<string> {
  const hidden = new Set<string>();
  for (const block of blocks) {
    if (block.type === BlockType.HERO_SPLIT) {
      const splitProps = heroSplitPropsSchema.parse(block.props);
      hidden.add(splitProps.leftBlockId);
      hidden.add(splitProps.rightBlockId);
    }
    if (block.type === BlockType.CATEGORY_PILLS) {
      const pillsProps = categoryPillsPropsSchema.parse(block.props);
      if (pillsProps.linkedBlockId) {
        hidden.add(block.id);
      }
    }
  }
  return hidden;
}

export function PageRenderer({ layout }: PageRendererProps): React.JSX.Element {
  const blocksById = new Map(layout.blocks.map((block) => [block.id, block]));
  const hiddenIds = collectHiddenBlockIds(layout.blocks);
  const topLevel = [...layout.blocks]
    .filter((block) => !hiddenIds.has(block.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <CategoryFilterProvider>
      <div className="space-y-10">
        {topLevel.map((block) => {
          const Component = BlockRegistry[block.type];
          if (!Component) return null;
          return <Component key={block.id} block={block} blocksById={blocksById} />;
        })}
      </div>
    </CategoryFilterProvider>
  );
}
