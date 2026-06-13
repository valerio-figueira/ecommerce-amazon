'use client';

import { curatedCollectionPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';

export function CuratedCollectionBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = curatedCollectionPropsSchema.parse(block.props);
  return (
    <section className="rounded-[var(--radius)] bg-white p-4 text-sm text-neutral-600">
      Coleção <strong>{props.collectionSlug}</strong> ({props.layout}) — página dedicada em fase 2.
    </section>
  );
}
