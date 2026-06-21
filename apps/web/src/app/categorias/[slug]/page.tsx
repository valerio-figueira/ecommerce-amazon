import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  buildFacetedListingMetadata,
  buildNotFoundMetadata,
  buildPageCanonical,
  hasCategoryFacetParams,
  parseListingPage,
} from '@ecommerce-amazon/shared/seo';

import { CategoryDescription } from '@/components/category/CategoryDescription';
import { CategoryProductsGrid } from '@/components/category/CategoryProductsGrid';
import { CategoryShell } from '@/components/category/CategoryShell';
import { CategorySidebar } from '@/components/category/CategorySidebar';
import { CategoryHeaderSkeleton } from '@/components/loading/CategoryHeaderSkeleton';
import { CategorySidebarSkeleton } from '@/components/loading/CategorySidebarSkeleton';
import { ProductGridSkeleton } from '@/components/loading/ProductGridSkeleton';
import { getCategory } from '@/lib/api/cached-fetchers';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategory(slug);
  if (!category) {
    return buildNotFoundMetadata('Categoria não encontrada');
  }

  const brand = getServerBrandConfig();
  const page = parseListingPage(sp);
  const hasFacetParams = hasCategoryFacetParams(sp);

  return buildFacetedListingMetadata({
    title: category.seoTitle ?? category.label,
    description:
      category.seoDescription ??
      `Explore produtos curados em ${category.label} com histórico de preços e análise editorial.`,
    canonicalPath: `/categorias/${category.slug}`,
    brand,
    page,
    hasFacetParams,
    openGraph: {
      title: category.seoTitle ?? category.label,
      description:
        category.seoDescription ??
        `Explore produtos curados em ${category.label} com histórico de preços e análise editorial.`,
      url: buildPageCanonical(`/categorias/${category.slug}`, brand),
    },
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <Suspense fallback={<CategorySidebarSkeleton />}>
          <CategorySidebar params={params} />
        </Suspense>

        <div className="min-w-0">
          <Suspense fallback={<CategoryHeaderSkeleton />}>
            <CategoryShell params={params} />
          </Suspense>

          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <CategoryProductsGrid params={params} searchParams={searchParams} />
          </Suspense>

          <Suspense fallback={null}>
            <CategoryDescription params={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
