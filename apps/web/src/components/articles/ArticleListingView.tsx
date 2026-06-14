import { Suspense } from 'react';

import { ArticleCard } from '@/components/articles/ArticleCard';
import { ArticleListingPagination } from '@/components/articles/ArticleListingPagination';
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
    <div className="space-y-8">
      <Suspense fallback={null}>
        <ArticleListingToolbar
          categories={categories}
          total={data.total}
          activeCategory={activeCategory}
          activeSearch={activeSearch}
        />
      </Suspense>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((article) => (
            <ArticleCard key={article.slug} article={article} showExcerpt />
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius)] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <p className="text-base font-medium text-neutral-900">Nenhum artigo encontrado</p>
          <p className="mt-2 text-sm text-neutral-500">
            Tente outra palavra-chave ou remova os filtros de categoria.
          </p>
        </div>
      )}

      <Suspense fallback={null}>
        <ArticleListingPagination page={data.page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
