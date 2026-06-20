'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  curatedCollectionPropsSchema,
  type RenderedCollectionSlide,
} from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { CuratedCollectionSlide } from '@/components/blocks/CuratedCollectionSlide';
import { mapDeliveryProductToListItem } from '@/lib/cms/map-delivery-product';

function resolveSlides(block: BlockComponentProps['block']): RenderedCollectionSlide[] {
  if (block.renderedCollections && block.renderedCollections.length > 0) {
    return block.renderedCollections;
  }

  if (block.renderedCollection) {
    return [
      {
        collection: block.renderedCollection,
        products: block.renderedData ?? [],
      },
    ];
  }

  return [];
}

export function CuratedCollectionBlock({
  block,
  isFirstBlock = false,
}: BlockComponentProps): React.JSX.Element {
  const props = curatedCollectionPropsSchema.parse(block.props);
  const slides = useMemo(() => resolveSlides(block), [block]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!props.autoplay || !emblaApi || slides.length <= 1) return;
    const timer = setInterval(() => emblaApi.scrollNext(), props.intervalMs);
    return () => clearInterval(timer);
  }, [emblaApi, props.autoplay, props.intervalMs, slides.length]);

  if (slides.length === 0) {
    return (
      <section className="rounded-[var(--radius)] bg-white p-4 text-sm text-neutral-600">
        Nenhuma coleção encontrada para <strong>{props.collectionSlugs.join(', ')}</strong>.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-neutral-300" aria-hidden />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            Coleções
          </h2>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs tabular-nums text-neutral-400 sm:inline">
              {index + 1}/{slides.length}
            </span>
            <button
              type="button"
              aria-label="Coleção anterior"
              onClick={() => emblaApi?.scrollPrev()}
              className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima coleção"
              onClick={() => emblaApi?.scrollNext()}
              className="rounded-full border border-neutral-200 p-2 text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, slideIndex) => (
            <div key={slide.collection.slug} className="min-w-0 flex-[0_0_100%]">
              <CuratedCollectionSlide
                collection={slide.collection}
                products={slide.products.map(mapDeliveryProductToListItem)}
                blockId={block.id}
                imagePriority={isFirstBlock && slideIndex === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
