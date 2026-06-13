'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import type { PageBlockDto, PageLayoutDto } from '@ecommerce-amazon/shared/cms';
import { heroSplitPropsSchema } from '@ecommerce-amazon/shared/cms';

import { CategoryFilterProvider } from '@/components/cms/CategoryFilterContext';
import { BlockRegistry } from '@/components/cms/BlockRegistry';

type PageRendererProps = {
  layout: PageLayoutDto;
};

function collectChildBlockIds(blocks: PageBlockDto[]): Set<string> {
  const childIds = new Set<string>();
  for (const block of blocks) {
    if (block.type === BlockType.HERO_SPLIT) {
      const props = heroSplitPropsSchema.parse(block.props);
      childIds.add(props.leftBlockId);
      childIds.add(props.rightBlockId);
    }
  }
  return childIds;
}

export function PageRenderer({ layout }: PageRendererProps): React.JSX.Element {
  const blocksById = new Map(layout.blocks.map((block) => [block.id, block]));
  const childIds = collectChildBlockIds(layout.blocks);
  const topLevel = [...layout.blocks]
    .filter((block) => !childIds.has(block.id))
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
