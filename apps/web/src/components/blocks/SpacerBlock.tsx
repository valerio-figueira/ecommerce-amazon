'use client';

import { spacerPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { cn } from '@/lib/utils';

export function SpacerBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = spacerPropsSchema.parse(block.props);
  return (
    <div
      className={cn(
        props.size === 'sm' && 'h-4',
        props.size === 'md' && 'h-8',
        props.size === 'lg' && 'h-16',
      )}
    />
  );
}
