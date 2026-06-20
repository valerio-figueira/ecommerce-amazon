'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/loading/ProductCardSkeleton';
import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';
import type { ProductListItemDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

type ProductCarouselProps = {
  products: ProductListItemDto[];
  blockId: string;
  placement?: ClickPlacementValue;
  isLoading?: boolean;
  skeletonCount?: number;
  emphasizeDiscount?: boolean;
  cardVariant?: 'default' | 'compact';
  slideSize?: 'default' | 'sm';
  catalogHref?: string;
  catalogCtaLabel?: string;
};

const SLIDE_SIZE_CLASS = {
  default: 'min-w-0 flex-[0_0_72%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_24%]',
  sm: 'min-w-0 flex-[0_0_62%] max-w-[210px] sm:flex-[0_0_38%] md:flex-[0_0_calc(28%-0.667rem)] lg:flex-[0_0_calc(22%-0.75rem)]',
} as const;

/** Breathing room so card box-shadows are not clipped by the Embla viewport. */
const SLIDE_INSET_CLASS = 'px-1.5 py-3';

export function ProductCarousel({
  products,
  blockId,
  placement,
  isLoading = false,
  skeletonCount = 8,
  emphasizeDiscount = false,
  cardVariant = 'default',
  slideSize = 'default',
  catalogHref,
  catalogCtaLabel,
}: ProductCarouselProps): React.JSX.Element {
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
  }, [emblaApi, products.length, isLoading]);

  const slideClass = SLIDE_SIZE_CLASS[slideSize];
  const isCompactCard = cardVariant === 'compact';
  const trackGap = isCompactCard || slideSize === 'sm' ? 'gap-3' : 'gap-4';
  const slideCount = isLoading ? skeletonCount : products.length;
  const showCarouselNav = slideCount > 1;

  const carouselNavButtonClass = cn(
    'hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 md:flex',
  );

  return (
    <div>
      {catalogHref && catalogCtaLabel && (
        <Link
          href={catalogHref}
          className="mb-4 inline-flex text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
        >
          {catalogCtaLabel}
        </Link>
      )}

      <div className={cn('flex items-center', showCarouselNav && 'md:-mx-2 md:gap-2')}>
        {showCarouselNav && (
          <button
            type="button"
            aria-label="Produtos anteriores"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={carouselNavButtonClass}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div ref={emblaRef} className="min-w-0 flex-1 overflow-hidden">
          <div className={cn('flex touch-pan-y items-stretch', trackGap)}>
            {isLoading
              ? Array.from({ length: Math.min(skeletonCount, 8) }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(slideClass, SLIDE_INSET_CLASS, isCompactCard && 'flex')}
                  >
                    <ProductCardSkeleton variant={isCompactCard ? 'compact' : 'default'} />
                  </div>
                ))
              : products.map((product) => (
                  <div
                    key={product.id}
                    className={cn(slideClass, SLIDE_INSET_CLASS, isCompactCard && 'flex')}
                  >
                    <ProductCard
                      product={product}
                      blockId={blockId}
                      {...(placement !== undefined ? { placement } : {})}
                      className={isCompactCard ? 'h-full w-full' : 'h-full'}
                      variant={cardVariant}
                      emphasizeDiscount={emphasizeDiscount}
                    />
                  </div>
                ))}
          </div>
        </div>

        {showCarouselNav && (
          <button
            type="button"
            aria-label="Próximos produtos"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={carouselNavButtonClass}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isLoading && slideCount > 0 && (
        <p className="mt-3 text-center text-xs text-neutral-400 md:hidden">
          Arraste para ver mais produtos
        </p>
      )}
    </div>
  );
}
