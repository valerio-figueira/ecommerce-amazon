import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  buildCategoryBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
} from '@ecommerce-amazon/shared/seo';

import { ProductCard } from '@/components/product/ProductCard';
import { apiFetchParsed } from '@/lib/api/client';
import {
  categoryDetailSchema,
  productsPageSchema,
  type CategoryDetailDto,
  type ProductListItemDto,
} from '@/lib/api/schemas';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getCategory(slug: string): Promise<CategoryDetailDto | null> {
  try {
    return await apiFetchParsed(`/categories/${slug}`, categoryDetailSchema);
  } catch {
    return null;
  }
}

async function getCategoryProducts(slug: string): Promise<ProductListItemDto[]> {
  const result = await apiFetchParsed(
    `/products?category=${encodeURIComponent(slug)}&visibleOnly=true&pageSize=24`,
    productsPageSchema,
  );
  return result.items;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return { title: 'Categoria não encontrada' };
  }

  return {
    title: category.seoTitle ?? `${category.label} | Vitrine`,
    description:
      category.seoDescription ??
      `Explore produtos curados em ${category.label} com histórico de preços e análise editorial.`,
    alternates: {
      canonical: `${getSiteBaseUrl()}/categorias/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }

  const products = await getCategoryProducts(slug);
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
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
    </main>
  );
}
