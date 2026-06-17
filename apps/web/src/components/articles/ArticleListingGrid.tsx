'use client';

import type { PublishedArticleListItem } from '@ecommerce-amazon/shared/admin';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { useArticleListingPending } from '@/components/articles/ArticleListingPendingContext';
import { ArticleCardSkeleton } from '@/components/loading/ArticleCardSkeleton';

type ArticleListingGridProps = {
  items: PublishedArticleListItem[];
};

const SKELETON_COUNT = 6;

export function ArticleListingGrid({ items }: ArticleListingGridProps): React.JSX.Element {
  const { isPending } = useArticleListingPending();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-neutral-500">Nenhum artigo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((article) => (
        <ArticleCard key={article.slug} article={article} showExcerpt />
      ))}
    </div>
  );
}
