import { Suspense } from 'react';

import {
  buildFacetedListingMetadata,
  hasArticleFacetParams,
  parseListingPage,
} from '@ecommerce-amazon/shared/seo';

import {
  ArticleListingGridSection,
} from '@/components/articles/ArticleListingGridSection';
import { ArticleListingPendingProvider } from '@/components/articles/ArticleListingPendingContext';
import {
  ArticleListingHeader,
  ArticleListingToolbarSection,
} from '@/components/articles/ArticleListingToolbarSection';
import { ArtigosPageTitle } from '@/components/articles/ArtigosPageTitle';
import { ArticleListingGridSkeleton } from '@/components/loading/ArticleListingGridSkeleton';
import { ArticleListingToolbarSkeleton } from '@/components/loading/ArticleListingToolbarSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 300;

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

export default function ArtigosPage({ searchParams }: ArtigosPageProps): React.JSX.Element {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10" aria-busy="true">
      <LoadingAnnouncer />

      <Suspense fallback={null}>
        <ArticleListingHeader searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={null}>
        <ArtigosPageTitle searchParams={searchParams} />
      </Suspense>

      <ArticleListingPendingProvider>
        <div className="space-y-8">
          <Suspense fallback={<ArticleListingToolbarSkeleton />}>
            <ArticleListingToolbarSection searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={<ArticleListingGridSkeleton />}>
            <ArticleListingGridSection searchParams={searchParams} />
          </Suspense>
        </div>
      </ArticleListingPendingProvider>
    </main>
  );
}
