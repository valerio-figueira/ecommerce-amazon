'use client';

import { categoryBentoGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import { CategoryBentoGrid } from '@/components/blocks/CategoryBentoGrid';
import type { BlockComponentProps } from '@/components/cms/BlockRegistry';

export function CategoryBentoGridBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = categoryBentoGridPropsSchema.parse(block.props);

  return <CategoryBentoGrid title={props.title} tiles={props.tiles} />;
}
