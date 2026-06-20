import Link from 'next/link';
import { Suspense } from 'react';

import { parseListingPage, buildFacetedListingMetadata } from '@ecommerce-amazon/shared/seo';

import { parseSearchResultType } from '@/lib/api/search';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import {
  SEARCH_MIN_LENGTH,
  SEARCH_RESULTS_PAGE_SIZE,
  searchArticlesResults,
  searchProductsResults,
} from '@/lib/api/search';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 300;

type BuscaPageProps = {
  searchParams: Promise<{
    q?: string;
    tipo?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: BuscaPageProps): Promise<import('next').Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const brand = getServerBrandConfig();
  const title = query ? `Busca: ${query}` : 'Busca';

  return buildFacetedListingMetadata({
    title,
    description: 'Encontre produtos e artigos na vitrine.',
    canonicalPath: '/busca',
    brand,
    hasFacetParams: query.length > 0,
    openGraph: {
      title,
      description: 'Encontre produtos e artigos na vitrine.',
      url: `${brand.url}/busca`,
    },
  });
}

export default async function BuscaPage({
  searchParams,
}: BuscaPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const activeType = parseSearchResultType(params.tipo);
  const page = parseListingPage(params);

  if (query.length < SEARCH_MIN_LENGTH) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Busca</h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          Use o ícone de busca no header ou o atalho{' '}
          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-sm">
            Ctrl+K
          </kbd>{' '}
          para encontrar produtos e artigos. Digite pelo menos {SEARCH_MIN_LENGTH} caracteres.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/artigos"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Ver artigos
          </Link>
          <Link
            href="/"
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Ir para home
          </Link>
        </div>
      </main>
    );
  }

  const [products, articles] = await Promise.all([
    searchProductsResults(query, {
      page: activeType === 'products' ? page : 1,
      pageSize: activeType === 'products' ? SEARCH_RESULTS_PAGE_SIZE : 1,
    }),
    searchArticlesResults(query, {
      page: activeType === 'articles' ? page : 1,
      limit: activeType === 'articles' ? SEARCH_RESULTS_PAGE_SIZE : 1,
    }),
  ]);

  const hasAnyResults = products.total > 0 || articles.total > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Resultados para &ldquo;{query}&rdquo;
        </h1>
        {!hasAnyResults ? (
          <p className="text-neutral-600">Nenhum produto ou artigo encontrado.</p>
        ) : null}
      </header>

      <Suspense fallback={null}>
        <SearchResultsView
          query={query}
          activeType={activeType}
          page={page}
          products={products}
          articles={articles}
        />
      </Suspense>
    </main>
  );
}
