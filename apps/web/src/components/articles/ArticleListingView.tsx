import { Suspense } from 'react';

import { ArticleListingGrid } from '@/components/articles/ArticleListingGrid';
import { ArticleListingPagination } from '@/components/articles/ArticleListingPagination';
import { ArticleListingPendingProvider } from '@/components/articles/ArticleListingPendingContext';
import { ArticleListingToolbar } from '@/components/articles/ArticleListingToolbar';
import type {
  ArticleCategoryPublic,
  PublishedArticlesListResponse,
} from '@ecommerce-amazon/shared/admin';

type ArticleListingViewProps = {
  data: PublishedArticlesListResponse;
  categories: ArticleCategoryPublic[];
  activeCategory: string | null;
  activeSearch: string;
};

export function ArticleListingView({
  data,
  categories,
  activeCategory,
  activeSearch,
}: ArticleListingViewProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <ArticleListingPendingProvider>
      <div className="space-y-8">
        <Suspense fallback={null}>
          <ArticleListingToolbar
            categories={categories}
            activeCategory={activeCategory}
            activeSearch={activeSearch}
          />
        </Suspense>

        <ArticleListingGrid items={data.items} />

        <Suspense fallback={null}>
          <ArticleListingPagination page={data.page} totalPages={totalPages} />
        </Suspense>
      </div>
    </ArticleListingPendingProvider>
  );
}
