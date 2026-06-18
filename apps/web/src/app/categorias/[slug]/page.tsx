import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  buildCategoryBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
  buildCategoryProductItemListJsonLd,
  buildFacetedListingMetadata,
  buildNotFoundMetadata,
  buildPageCanonical,
  hasCategoryFacetParams,
  parseListingPage,
} from '@ecommerce-amazon/shared/seo';

import { CategoryProductsError } from '@/components/category/CategoryProductsError';
import { CategorySidebarTree } from '@/components/category/CategorySidebarTree';
import { ListingPagination } from '@/components/listing/ListingPagination';
import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { fetchCategoryTree } from '@/lib/api/categories';
import { getCategory } from '@/lib/api/cached-fetchers';
import { apiFetchParsed, isNotFoundError } from '@/lib/api/client';
import {
  productsPageSchema,
  type ProductListItemDto,
} from '@/lib/api/schemas';
import { totalListingPages, VITRINE_LISTING_PAGE_SIZE } from '@/lib/listing';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

type CategoryProductsResult = {
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  error: boolean;
};

async function getCategoryProducts(
  slug: string,
  page: number,
): Promise<CategoryProductsResult> {
  try {
    const params = new URLSearchParams({
      category: slug,
      visibleOnly: 'true',
      pageSize: String(VITRINE_LISTING_PAGE_SIZE),
      page: String(page),
    });
    const result = await apiFetchParsed(`/products?${params.toString()}`, productsPageSchema);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      error: false,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return { items: [], total: 0, page, pageSize: VITRINE_LISTING_PAGE_SIZE, error: false };
    }
    return { items: [], total: 0, page, pageSize: VITRINE_LISTING_PAGE_SIZE, error: true };
  }
}

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
  const sp = await searchParams;
  const page = parseListingPage(sp);
  const [category, productsResult, categoryTree] = await Promise.all([
    getCategory(slug),
    getCategoryProducts(slug, page),
    fetchCategoryTree().catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const { items: products, total, pageSize, error: productsError } = productsResult;
  const totalPages = totalListingPages(total, pageSize);
  const siteBaseUrl = getSiteBaseUrl();
  const breadcrumbJsonLd = buildCategoryBreadcrumbJsonLd({
    siteBaseUrl,
    slug: category.slug,
    label: category.label,
    breadcrumbs: category.breadcrumbs,
    productCount: category.productCount,
    seoDescription: category.seoDescription,
  });
  const collectionJsonLd = buildCategoryCollectionJsonLd({
    siteBaseUrl,
    slug: category.slug,
    label: category.label,
    breadcrumbs: category.breadcrumbs,
    productCount: category.productCount,
    seoDescription: category.seoDescription,
  });
  const productItemListJsonLd = buildCategoryProductItemListJsonLd({
    siteBaseUrl,
    categoryLabel: category.label,
    products: products.slice(0, 10).map((product) => ({
      slug: product.slug,
      title: product.title,
    })),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {products.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productItemListJsonLd) }}
        />
      ) : null}

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {categoryTree.length > 0 && (
          <aside className="mb-8 hidden lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Navegar
            </p>
            <CategorySidebarTree nodes={categoryTree} activeSlug={category.slug} />
          </aside>
        )}

        <div className="min-w-0">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/">Home</Link>
        {category.breadcrumbs.map((crumb) => (
          <span key={crumb.slug}>
            <span className="mx-2">/</span>
            {crumb.slug === category.slug ? (
              <span>{crumb.label}</span>
            ) : (
              <Link href={`/categorias/${crumb.slug}`}>{crumb.label}</Link>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
          {category.label}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {total} produto{total === 1 ? '' : 's'} nesta categoria
        </p>
      </header>

      {category.children.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.slug}
                href={`/categorias/${child.slug}`}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                {child.label}
                <span className="ml-2 text-neutral-400">({child.productCount})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12 space-y-8">
        {productsError ? (
          <CategoryProductsError />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                clickOrigin="listagem"
                placement={ClickPlacement.CATEGORY_LISTING}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-neutral-500">
            Nenhum produto visível nesta categoria no momento.
          </p>
        )}

        <Suspense fallback={null}>
          <ListingPagination
            page={page}
            totalPages={totalPages}
            ariaLabel="Paginação de produtos da categoria"
          />
        </Suspense>
      </section>

      {category.descriptionHtml && (
        <section
          className="prose prose-neutral max-w-none border-t border-neutral-200 pt-8"
          dangerouslySetInnerHTML={{ __html: category.descriptionHtml }}
        />
      )}
        </div>
      </div>
    </main>
  );
}
