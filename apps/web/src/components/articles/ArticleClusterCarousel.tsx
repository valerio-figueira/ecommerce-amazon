'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import type { ArticleClusterPublic } from '@ecommerce-amazon/shared/admin';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { ArticleCard } from './ArticleCard';
import { cn } from '@/lib/utils';

type ArticleClusterCarouselProps = {
  cluster: ArticleClusterPublic;
  currentSlug: string;
};

export function ArticleClusterCarousel({
  cluster,
  currentSlug,
}: ArticleClusterCarouselProps): React.JSX.Element | null {
  if (cluster.members.length <= 1) {
    return null;
  }

  return (
    <section className="mt-12" aria-label="Artigos do guia">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-neutral-900">
          Explore o guia: {cluster.name}
        </h2>
        {cluster.role === 'spoke' ? (
          <Link
            href={`/artigos/${cluster.pilarArticle.slug}`}
            className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
          >
            Voltar ao guia principal: {cluster.pilarArticle.title}
          </Link>
        ) : null}
      </div>

      <div className="md:hidden">
        <div className="grid grid-cols-1 gap-4">
          {cluster.members.map((member) => (
            <div
              key={member.id}
              className={cn(
                member.slug === currentSlug &&
                  'rounded-[var(--radius)] ring-2 ring-emerald-500 ring-offset-2',
              )}
            >
              <ArticleCard
                article={{
                  id: member.id,
                  slug: member.slug,
                  title: member.title,
                  excerpt: member.excerpt,
                  coverImageUrl: member.coverImageUrl,
                  publishedAt: member.publishedAt,
                }}
                showExcerpt
                isCurrent={member.slug === currentSlug}
                engagementPlacement={ClickPlacement.ARTICLE_RELATED}
              />
            </div>
          ))}
        </div>
      </div>

      <ArticleClusterCarouselDesktop cluster={cluster} currentSlug={currentSlug} />
    </section>
  );
}

function ArticleClusterCarouselDesktop({
  cluster,
  currentSlug,
}: ArticleClusterCarouselProps): React.JSX.Element {
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
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const showNav = cluster.members.length > 2;

  return (
    <div className="hidden md:block">
      <div className={cn('flex items-center', showNav && 'gap-2')}>
        {showNav ? (
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Artigo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0 flex-1 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {cluster.members.map((member) => (
              <div
                key={member.id}
                className={cn(
                  'min-w-0 flex-[0_0_72%] lg:flex-[0_0_32%]',
                  member.slug === currentSlug &&
                    'rounded-[var(--radius)] ring-2 ring-emerald-500 ring-offset-2',
                )}
              >
                <ArticleCard
                  article={{
                    id: member.id,
                    slug: member.slug,
                    title: member.title,
                    excerpt: member.excerpt,
                    coverImageUrl: member.coverImageUrl,
                    publishedAt: member.publishedAt,
                  }}
                  showExcerpt
                  isCurrent={member.slug === currentSlug}
                  engagementPlacement={ClickPlacement.ARTICLE_RELATED}
                />
              </div>
            ))}
          </div>
        </div>

        {showNav ? (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Próximo artigo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
