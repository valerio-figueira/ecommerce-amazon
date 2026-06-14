'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { heroCarouselPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { cn } from '@/lib/utils';

export function HeroCarouselBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = heroCarouselPropsSchema.parse(block.props);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
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
    if (!props.autoplay || !emblaApi) return;
    const timer = setInterval(() => emblaApi.scrollNext(), props.intervalMs);
    return () => clearInterval(timer);
  }, [emblaApi, props.autoplay, props.intervalMs]);

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[var(--radius)] bg-neutral-900 text-white md:aspect-[5/2]">
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full">
          {props.slides.map((slide) => (
            <div key={slide.title} className="relative h-full min-w-0 flex-[0_0_100%]">
              <div className="relative h-full w-full">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-80"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10">
                  <h2 className="max-w-lg text-2xl font-bold md:text-4xl">{slide.title}</h2>
                  {slide.subtitle && (
                    <p className="mt-2 max-w-md text-sm text-neutral-200 md:text-base">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaLabel && slide.ctaHref && (
                    <a
                      href={slide.ctaHref}
                      className={cn(
                        'mt-4 inline-flex rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10',
                      )}
                    >
                      {slide.ctaLabel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs">
        {index + 1}/{props.slides.length}
      </div>
    </div>
  );
}
