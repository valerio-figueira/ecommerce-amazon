'use client';

import { richTextPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { cn } from '@/lib/utils';

export function RichTextBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = richTextPropsSchema.parse(block.props);
  return (
    <div
      className={cn(
        'prose prose-neutral max-w-none rounded-[var(--radius)] bg-white p-6',
        props.align === 'center' && 'text-center',
        props.align === 'right' && 'text-right',
      )}
      dangerouslySetInnerHTML={{ __html: props.html }}
    />
  );
}
