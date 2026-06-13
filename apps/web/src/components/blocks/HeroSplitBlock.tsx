'use client';

import { heroSplitPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { BlockRegistry } from '@/components/cms/BlockRegistry';
import { cn } from '@/lib/utils';

export function HeroSplitBlock({ block, blocksById }: BlockComponentProps): React.JSX.Element | null {
  const props = heroSplitPropsSchema.parse(block.props);
  const left = blocksById[props.leftBlockId];
  const right = blocksById[props.rightBlockId];

  if (!left || !right) return null;

  const Left = BlockRegistry[left.type];
  const Right = BlockRegistry[right.type];

  if (!Left || !Right) return null;

  return (
    <div
      className={cn(
        'grid gap-4 md:items-stretch',
        props.ratio === '2/1' ? 'md:grid-cols-3' : 'md:grid-cols-2',
      )}
    >
      <div
        className={cn(
          props.ratio === '2/1' ? 'md:col-span-2' : '',
          'aspect-[16/10] w-full md:aspect-[16/9]',
        )}
      >
        <div className="h-full">
          <Left block={left} blocksById={blocksById} />
        </div>
      </div>
      <div className="min-h-0">
        <div className="h-full">
          <Right block={right} blocksById={blocksById} />
        </div>
      </div>
    </div>
  );
}
