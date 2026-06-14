import { ArticleListingView } from '@/components/articles/ArticleListingView';
import {
  fetchPublicArticleCategories,
  fetchPublishedArticles,
} from '@/lib/api/articles';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

const PAGE_SIZE = 12;

type ArtigosPageProps = {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
  }>;
};

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export const metadata = {
  title: 'Artigos | Vitrine',
  description:
    'Guias, reviews e comparativos editoriais para escolher produtos com mais confiança.',
  alternates: {
    canonical: `${getSiteBaseUrl()}/artigos`,
  },
};

export default async function ArtigosPage({
  searchParams,
}: ArtigosPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const page = parsePage(params.page);
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
      <header className="mb-8 space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Blog editorial</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          {activeCategoryLabel ? `Artigos em ${activeCategoryLabel}` : 'Artigos'}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base">
          Guias, reviews e comparativos com curadoria humana. Use a busca e as categorias para
          encontrar o conteúdo certo para sua decisão de compra.
        </p>
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
