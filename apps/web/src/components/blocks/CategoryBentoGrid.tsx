'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { CategoryBentoGridProps, CategoryBentoTile } from '@ecommerce-amazon/shared/cms';

import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { cn } from '@/lib/utils';

type CategoryBentoGridPropsView = {
  title: CategoryBentoGridProps['title'];
  tiles: CategoryBentoGridProps['tiles'];
};

type CategoryBentoTileCardProps = {
  tile: CategoryBentoTile;
};

function CategoryBentoTileCard({ tile }: CategoryBentoTileCardProps): React.JSX.Element {
  const { categorySlug, setCategorySlug } = useCategoryFilter();
  const isActive = Boolean(tile.categorySlug && categorySlug === tile.categorySlug);

  const cardClassName = cn(
    'group relative flex min-h-[9.5rem] flex-col overflow-hidden rounded-2xl bg-neutral-100 p-5 transition-shadow md:min-h-[11rem]',
    tile.size === 'large' && 'col-span-2',
    isActive && 'ring-2 ring-[var(--primary)] ring-offset-2',
    (tile.href || tile.categorySlug) && 'hover:shadow-md',
  );

  const content = (
    <>
      <div className="relative z-10 max-w-[65%]">
        <h3 className="text-base font-semibold leading-tight text-neutral-900 md:text-lg">
          {tile.title}
        </h3>
        {tile.subtitle && (
          <p className="mt-1 text-sm text-neutral-500">{tile.subtitle}</p>
        )}
      </div>
      <Image
        src={tile.imageUrl}
        alt=""
        width={240}
        height={240}
        className={cn(
          'pointer-events-none absolute bottom-0 right-0 h-auto w-[42%] max-w-[9.5rem] object-contain object-bottom-right transition-transform duration-300 md:max-w-[11rem]',
          tile.size === 'large' && 'md:max-w-[13rem]',
          (tile.href || tile.categorySlug) && 'group-hover:scale-105',
        )}
        aria-hidden
      />
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
      <button
        type="button"
        onClick={() => setCategorySlug(isActive ? null : tile.categorySlug ?? null)}
        className={cn(cardClassName, 'text-left')}
      >
        {content}
      </button>
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
