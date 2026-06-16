'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import type { RenderedCollection } from '@ecommerce-amazon/shared/cms';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { CollectionProductCard } from '@/components/product/CollectionProductCard';
import type { ProductListItemDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

type CuratedCollectionSlideProps = {
  collection: RenderedCollection;
  products: ProductListItemDto[];
  blockId: string;
  className?: string;
  imagePriority?: boolean;
};

export function CuratedCollectionSlide({
  collection,
  products,
  blockId,
  className,
  imagePriority = false,
}: CuratedCollectionSlideProps): React.JSX.Element {
  const previewProducts = products.slice(0, 2);
  const collectionHref = `/colecoes/${collection.slug}`;

  return (
    <article
      className={cn(
        'group/slide overflow-hidden rounded-[var(--radius)] border border-neutral-800 bg-neutral-900 text-white shadow-lg transition-all duration-500 hover:border-neutral-700 hover:shadow-2xl',
        className,
      )}
    >
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[220px] overflow-hidden md:min-h-[340px]">
          <RemoteImage
            src={collection.coverImageUrl}
            alt={collection.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover/slide:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
            {...(imagePriority
              ? { priority: true }
              : { loading: 'lazy' as const, decoding: 'async' as const })}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent transition-opacity duration-500 group-hover/slide:opacity-70"
            aria-hidden
          />
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300 transition-colors duration-300 group-hover/slide:text-emerald-200">
            Coleção curada
          </p>
          <h3 className="text-2xl font-bold transition-transform duration-500 group-hover/slide:translate-x-0.5 md:text-3xl">
            {collection.title}
          </h3>
          <p className="text-sm leading-relaxed text-neutral-300 transition-colors duration-300 group-hover/slide:text-neutral-200 md:text-base">
            {collection.description}
          </p>

          {previewProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1 sm:gap-4">
              {previewProducts.map((product) => (
                <CollectionProductCard
                  key={product.id}
                  product={product}
                  blockId={blockId}
                  collectionId={collection.id}
                  placement={ClickPlacement.CMS_CURATED_COLLECTION}
                  utmDefaults={collection.utmDefaults}
                  className="transition-transform duration-300 group-hover/slide:-translate-y-1"
                />
              ))}
            </div>
          )}

          <Link
            href={collectionHref}
            className="mt-2 inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-100 hover:shadow-md active:scale-[0.98]"
          >
            {collection.ctaText}
          </Link>
        </div>
      </div>
    </article>
  );
}
