import {
  buildFacetedListingMetadata,
  hasArticleFacetParams,
  parseListingPage,
} from '@ecommerce-amazon/shared/seo';

import { ArticleListingView } from '@/components/articles/ArticleListingView';
import {
  fetchPublicArticleCategories,
  fetchPublishedArticles,
} from '@/lib/api/articles';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 300;

const PAGE_SIZE = 12;

type ArtigosPageProps = {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ArtigosPageProps): Promise<import('next').Metadata> {
  const params = await searchParams;
  const brand = getServerBrandConfig();
  const page = parseListingPage(params);
  const hasFacetParams = hasArticleFacetParams(params);

  return buildFacetedListingMetadata({
    title: 'Artigos',
    description:
      'Guias, reviews e comparativos editoriais para escolher produtos com mais confiança.',
    canonicalPath: '/artigos',
    brand,
    page,
    hasFacetParams,
    openGraph: {
      title: 'Artigos',
      description:
        'Guias, reviews e comparativos editoriais para escolher produtos com mais confiança.',
      url: `${brand.url}/artigos`,
    },
  });
}

export default async function ArtigosPage({
  searchParams,
}: ArtigosPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = parseListingPage(params);
  const activeCategory = params.categoria?.trim() || null;
  const activeSearch = params.q?.trim() || '';

  const [data, categoriesResponse] = await Promise.all([
    fetchPublishedArticles({
      page,
      limit: PAGE_SIZE,
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(activeSearch ? { search: activeSearch } : {}),
    }),
    fetchPublicArticleCategories(),
  ]);

  const activeCategoryLabel = activeCategory
    ? categoriesResponse.items.find((item) => item.slug === activeCategory)?.name ?? activeCategory
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {activeCategoryLabel ?? 'Artigos'}
        </h1>
      </header>

      <ArticleListingView
        data={data}
        categories={categoriesResponse.items}
        activeCategory={activeCategory}
        activeSearch={activeSearch}
      />
    </main>
  );
}
