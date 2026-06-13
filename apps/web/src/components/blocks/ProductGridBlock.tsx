'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BlockType } from '@ecommerce-amazon/domain';
import { categoryPillsPropsSchema, productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { CategoryPillsRow } from '@/components/blocks/CategoryPillsRow';
import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { ProductCard } from '@/components/product/ProductCard';
import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

const DEFAULT_CATALOG_SLUG = 'home-office';

function findLinkedPillsBlock(
  blocksById: Record<string, BlockComponentProps['block']>,
  gridBlockId: string,
): BlockComponentProps['block'] | undefined {
  for (const candidate of Object.values(blocksById)) {
    if (candidate.type !== BlockType.CATEGORY_PILLS) continue;
    const pillsProps = categoryPillsPropsSchema.parse(candidate.props);
    if (pillsProps.linkedBlockId === gridBlockId) return candidate;
  }
  return undefined;
}

function resolveCatalogHref(
  catalogHref: string | undefined,
  activeCategory: string | undefined,
): string {
  if (catalogHref) {
    return catalogHref;
  }

  if (activeCategory) {
    return `/categorias/${activeCategory}`;
  }

  return `/categorias/${DEFAULT_CATALOG_SLUG}`;
}

export function ProductGridBlock({
  block,
  blocksById,
}: BlockComponentProps): React.JSX.Element {
  const props = productGridPropsSchema.parse(block.props);
  const { categorySlug } = useCategoryFilter();
  const activeCategory = categorySlug ?? props.categorySlug ?? undefined;

  const linkedPills = findLinkedPillsBlock(blocksById, block.id);
  const linkedPillsProps = linkedPills
    ? categoryPillsPropsSchema.parse(linkedPills.props)
    : undefined;

  const queryParams = new URLSearchParams();
  queryParams.set('pageSize', String(props.pageSize));
  if (activeCategory) queryParams.set('category', activeCategory);
  if (props.marketplace) queryParams.set('marketplace', props.marketplace);
  queryParams.set('sort', props.sort);
  queryParams.set('visibleOnly', 'true');

  const { data, isLoading } = useQuery({
    queryKey: ['products', activeCategory, props.sort, props.pageSize, props.marketplace, 'home-visible'],
    queryFn: () => apiFetchParsed(`/products?${queryParams.toString()}`, productsPageSchema),
  });

  const catalogHref = useMemo(
    () => resolveCatalogHref(props.catalogHref, activeCategory),
    [props.catalogHref, activeCategory],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, data?.items.length, activeCategory]);

  const slideCount = isLoading ? props.pageSize : (data?.items.length ?? 0);

  return (
    <section>
      <div
        className={cn(
          'mb-6 flex flex-col gap-4',
          linkedPillsProps && 'md:flex-row md:items-start md:justify-between',
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
          <Link
            href={catalogHref}
            className="inline-flex text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
          >
            {props.catalogCtaLabel}
          </Link>
        </div>
        {linkedPillsProps && (
          <CategoryPillsRow
            categorySlugs={linkedPillsProps.categorySlugs}
            mode={linkedPillsProps.mode}
            showSubcategories={linkedPillsProps.showSubcategories}
          />
        )}
      </div>

      <div className="relative px-1 md:px-10">
        <button
          type="button"
          aria-label="Produtos anteriores"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          className={cn(
            'absolute left-0 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 md:flex',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y gap-4">
            {isLoading
              ? Array.from({ length: Math.min(props.pageSize, 8) }).map((_, index) => (
                  <div
                    key={index}
                    className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_24%]"
                  >
                    <div className="aspect-[4/5] animate-pulse rounded-2xl bg-neutral-200" />
                  </div>
                ))
              : data?.items.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_24%]"
                  >
                    <ProductCard product={product} blockId={block.id} className="h-full" />
                  </div>
                ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Próximos produtos"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          className={cn(
            'absolute right-0 top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 md:flex',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {!isLoading && slideCount > 0 && (
          <p className="mt-3 text-center text-xs text-neutral-400 md:hidden">
            Arraste para ver mais produtos
          </p>
        )}
      </div>
    </section>
  );
}
