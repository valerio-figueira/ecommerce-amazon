import Link from 'next/link';
import { notFound } from 'next/navigation';

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
import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { fetchCategoryTree } from '@/lib/api/categories';
import { apiFetchParsed, isNotFoundError } from '@/lib/api/client';
import { fetchOrNotFound } from '@/lib/api/safe-fetch';
import {
  categoryDetailSchema,
  productsPageSchema,
  type CategoryDetailDto,
  type ProductListItemDto,
} from '@/lib/api/schemas';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getCategory(slug: string): Promise<CategoryDetailDto | null> {
  return fetchOrNotFound(`/categories/${slug}`, categoryDetailSchema);
}

type CategoryProductsResult = {
  items: ProductListItemDto[];
  error: boolean;
};

async function getCategoryProducts(slug: string): Promise<CategoryProductsResult> {
  try {
    const result = await apiFetchParsed(
      `/products?category=${encodeURIComponent(slug)}&visibleOnly=true&pageSize=24`,
      productsPageSchema,
    );
    return { items: result.items, error: false };
  } catch (error) {
    if (isNotFoundError(error)) {
      return { items: [], error: false };
    }
    return { items: [], error: true };
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
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const [category, productsResult, categoryTree] = await Promise.all([
    getCategory(slug),
    getCategoryProducts(slug),
    fetchCategoryTree().catch(() => []),
  ]);

  if (!category) {
    notFound();
  }

  const { items: products, error: productsError } = productsResult;
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
          {category.productCount} produto{category.productCount === 1 ? '' : 's'} nesta categoria
        </p>
      </header>

      {category.children.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Subcategorias</h2>
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

      <section className="mb-12">
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
