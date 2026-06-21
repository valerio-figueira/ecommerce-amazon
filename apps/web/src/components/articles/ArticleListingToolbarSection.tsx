import { Suspense } from 'react';

import { fetchPublicArticleCategories } from '@/lib/api/articles';

import { ArticleListingToolbar } from './ArticleListingToolbar';

type ArticleListingToolbarSectionProps = {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
  }>;
};

export async function ArticleListingToolbarSection({
  searchParams,
}: ArticleListingToolbarSectionProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const activeCategory = params.categoria?.trim() || null;
  const activeSearch = params.q?.trim() || '';

  const categoriesResponse = await fetchPublicArticleCategories().catch(() => ({ items: [] }));

  return (
    <Suspense fallback={null}>
      <ArticleListingToolbar
        categories={categoriesResponse.items}
        activeCategory={activeCategory}
        activeSearch={activeSearch}
      />
    </Suspense>
  );
}

export async function ArticleListingHeader({
  searchParams,
}: ArticleListingToolbarSectionProps): Promise<React.JSX.Element | null> {
  const params = await searchParams;
  const activeCategory = params.categoria?.trim() || null;

  if (!activeCategory) {
    return null;
  }

  const categoriesResponse = await fetchPublicArticleCategories().catch(() => ({ items: [] }));
  const activeCategoryLabel =
    categoriesResponse.items.find((item) => item.slug === activeCategory)?.name ?? activeCategory;

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
        {activeCategoryLabel}
      </h1>
    </header>
  );
}
