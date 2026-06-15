'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import type { ArticleClusterPublic } from '@ecommerce-amazon/shared/admin';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { ArticleCard } from './ArticleCard';

type ArticleClusterCarouselProps = {
  cluster: ArticleClusterPublic;
  currentSlug: string;
};

type ClusterMember = ArticleClusterPublic['members'][number];

/** Three slides visible; gap-3 (0.75rem) × 2 between them = 1.5rem subtracted from track width. */
const SLIDE_SIZE_THREE_VISIBLE = 'min-w-0 flex-[0_0_calc((100%-1.5rem)/3)]';
const SLIDE_SIZE_TWO_VISIBLE = 'min-w-0 flex-[0_0_calc((100%-0.75rem)/2)]';

function staticRowSlideClass(memberCount: number): string {
  if (memberCount <= 2) return SLIDE_SIZE_TWO_VISIBLE;
  return SLIDE_SIZE_THREE_VISIBLE;
}

function ClusterMemberCard({
  member,
  currentSlug,
}: {
  member: ClusterMember;
  currentSlug: string;
}): React.JSX.Element {
  return (
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
  );
}

export function ArticleClusterCarousel({
  cluster,
  currentSlug,
}: ArticleClusterCarouselProps): React.JSX.Element | null {
  if (cluster.members.length <= 1) {
    return null;
  }

  const useCarousel = cluster.members.length > 3;

  return (
    <section className="mt-12 overflow-hidden" aria-label="Artigos do guia">
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
            <ClusterMemberCard key={member.id} member={member} currentSlug={currentSlug} />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        {useCarousel ? (
          <ArticleClusterEmblaCarousel cluster={cluster} currentSlug={currentSlug} />
        ) : (
          <div className="flex items-stretch gap-3 py-0.5">
            {cluster.members.map((member) => (
              <div key={member.id} className={staticRowSlideClass(cluster.members.length)}>
                <ClusterMemberCard member={member} currentSlug={currentSlug} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ArticleClusterEmblaCarousel({
  cluster,
  currentSlug,
}: ArticleClusterCarouselProps): React.JSX.Element {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
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

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, cluster.members.length]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Artigos anteriores"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden py-0.5" ref={emblaRef}>
        <div className="flex items-stretch gap-3">
          {cluster.members.map((member) => (
            <div key={member.id} className={SLIDE_SIZE_THREE_VISIBLE}>
              <ClusterMemberCard member={member} currentSlug={currentSlug} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próximos artigos"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
