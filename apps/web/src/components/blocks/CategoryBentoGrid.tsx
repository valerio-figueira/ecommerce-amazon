'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { CategoryBentoGridProps, CategoryBentoTile } from '@ecommerce-amazon/shared/cms';

import { cn } from '@/lib/utils';

type CategoryBentoGridPropsView = {
  title: CategoryBentoGridProps['title'];
  tiles: CategoryBentoGridProps['tiles'];
};

type CategoryBentoTileCardProps = {
  tile: CategoryBentoTile;
};

function CategoryBentoTileCard({ tile }: CategoryBentoTileCardProps): React.JSX.Element {
  const isInteractive = Boolean(tile.href || tile.categorySlug);

  const cardClassName = cn(
    'group relative block min-h-[9.5rem] overflow-hidden rounded-2xl bg-neutral-200 md:min-h-[11rem]',
    tile.size === 'large' && 'col-span-2',
    isInteractive && 'hover:shadow-md',
  );

  const content = (
    <>
      <Image
        src={tile.imageUrl}
        alt=""
        fill
        sizes={
          tile.size === 'large'
            ? '(max-width: 768px) 100vw, 50vw'
            : '(max-width: 768px) 50vw, 25vw'
        }
        className={cn(
          'object-cover transition-transform duration-500 ease-out',
          isInteractive && 'group-hover:scale-105',
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent"
        aria-hidden
      />
      <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-1.5 md:left-4 md:top-4">
        <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold leading-tight text-neutral-900 shadow-sm backdrop-blur-sm">
          {tile.title}
        </span>
        {tile.subtitle && (
          <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-sm">
            {tile.subtitle}
          </span>
        )}
      </div>
    </>
  );

  if (tile.href) {
    return (
      <Link href={tile.href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  if (tile.categorySlug) {
    return (
      <Link href={`/categorias/${tile.categorySlug}`} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}

export function CategoryBentoGrid({
  title,
  tiles,
}: CategoryBentoGridPropsView): React.JSX.Element {
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-neutral-900 md:mb-6 md:text-3xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {tiles.map((tile, index) => (
          <CategoryBentoTileCard key={`${tile.title}-${index}`} tile={tile} />
        ))}
      </div>
    </section>
  );
}
