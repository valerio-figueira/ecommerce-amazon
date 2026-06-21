import { Suspense } from 'react';

import { parseListingPage } from '@ecommerce-amazon/shared/seo';

import { ArticleListingGrid } from '@/components/articles/ArticleListingGrid';
import { ArticleListingPagination } from '@/components/articles/ArticleListingPagination';
import { fetchPublishedArticles } from '@/lib/api/articles';

const PAGE_SIZE = 12;
const EMPTY_LISTING = { items: [], total: 0, page: 1, limit: PAGE_SIZE };

type ArticleListingGridSectionProps = {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
  }>;
};

export async function ArticleListingGridSection({
  searchParams,
}: ArticleListingGridSectionProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = parseListingPage(params);
  const activeCategory = params.categoria?.trim() || null;
  const activeSearch = params.q?.trim() || '';

  const data = await fetchPublishedArticles({
    page,
    limit: PAGE_SIZE,
    ...(activeCategory ? { category: activeCategory } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  }).catch(() => EMPTY_LISTING);

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <>
      <ArticleListingGrid items={data.items} />

      <Suspense fallback={null}>
        <ArticleListingPagination page={data.page} totalPages={totalPages} />
      </Suspense>
    </>
  );
}
