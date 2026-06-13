'use client';

import Image from 'next/image';
import Link from 'next/link';

import { curatedCollectionPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { ProductCard } from '@/components/product/ProductCard';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';

export function CuratedCollectionBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = curatedCollectionPropsSchema.parse(block.props);
  const collection = block.renderedCollection;
  const products = (block.renderedData ?? []).map(mapDeliveryProductToListItem);
  const previewProducts = products.slice(0, props.layout === 'carousel' ? products.length : 4);
  const collectionHref = `/colecoes/${props.collectionSlug}`;

  if (!collection) {
    return (
      <section className="rounded-[var(--radius)] bg-white p-4 text-sm text-neutral-600">
        Coleção <strong>{props.collectionSlug}</strong> não encontrada.
      </section>
    );
  }

  if (props.layout === 'carousel') {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">{collection.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{collection.description}</p>
          </div>
          <Link
            href={collectionHref}
            className="shrink-0 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {collection.ctaText}
          </Link>
        </div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {previewProducts.map((product, index) => (
            <div key={product.id} className="relative w-56 shrink-0">
              <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                {index + 1}
              </div>
              <ProductCard product={product} blockId={block.id} clickOrigin="coleção" variant="compact" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius)] border border-neutral-100 bg-neutral-900 text-white">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] md:min-h-[320px]">
          <Image
            src={collection.coverImageUrl}
            alt={collection.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Coleção curada
          </p>
          <h2 className="text-2xl font-bold md:text-3xl">{collection.title}</h2>
          <p className="text-sm leading-relaxed text-neutral-300 md:text-base">
            {collection.description}
          </p>
          {previewProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {previewProducts.slice(0, 2).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  blockId={block.id}
                  clickOrigin="coleção"
                  variant="compact"
                />
              ))}
            </div>
          )}
          <Link
            href={collectionHref}
            className="mt-2 inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            {collection.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
