'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { ArticleCardSkeleton } from '@/components/loading/ArticleCardSkeleton';
import type { EngagementPlacementValue } from '@ecommerce-amazon/shared/analytics';
import type { ArticleTrendDeliveryItem } from '@ecommerce-amazon/shared/cms';
import { cn } from '@/lib/utils';

type ArticleCarouselProps = {
  articles: ArticleTrendDeliveryItem[];
  engagementPlacement?: EngagementPlacementValue;
  isLoading?: boolean;
  skeletonCount?: number;
  catalogHref?: string;
  catalogCtaLabel?: string;
};

const SLIDE_SIZE_CLASS =
  'min-w-0 flex-[0_0_72%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_28%]';

const SLIDE_INSET_CLASS = 'px-1.5 py-3';

export function ArticleCarousel({
  articles,
  engagementPlacement,
  isLoading = false,
  skeletonCount = 8,
  catalogHref,
  catalogCtaLabel,
}: ArticleCarouselProps): React.JSX.Element {
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
  }, [emblaApi, articles.length, isLoading]);

  const slideCount = isLoading ? skeletonCount : articles.length;
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
            aria-label="Artigos anteriores"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={carouselNavButtonClass}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div ref={emblaRef} className="min-w-0 flex-1 overflow-hidden">
          <div className="flex touch-pan-y items-stretch gap-3">
            {isLoading
              ? Array.from({ length: Math.min(skeletonCount, 8) }).map((_, index) => (
                  <div key={index} className={cn(SLIDE_SIZE_CLASS, SLIDE_INSET_CLASS, 'flex')}>
                    <ArticleCardSkeleton />
                  </div>
                ))
              : articles.map((article) => (
                  <div key={article.id} className={cn(SLIDE_SIZE_CLASS, SLIDE_INSET_CLASS, 'flex')}>
                    <div className="h-full w-full">
                      <ArticleCard
                        article={{
                          id: article.id,
                          slug: article.slug,
                          title: article.title,
                          excerpt: article.excerpt,
                          coverImageUrl: article.coverImageUrl,
                          publishedAt: article.publishedAt,
                        }}
                        showExcerpt
                        {...(engagementPlacement !== undefined ? { engagementPlacement } : {})}
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {showCarouselNav && (
          <button
            type="button"
            aria-label="Próximos artigos"
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
          Arraste para ver mais artigos
        </p>
      )}
    </div>
  );
}
