import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  buildCategoryBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
} from '@ecommerce-amazon/shared/seo';

import { getCategory } from '@/lib/api/cached-fetchers';
import { getSiteBaseUrl } from '@/lib/site-url';

type CategoryShellProps = {
  params: Promise<{ slug: string }>;
};

export async function CategoryShell({
  params,
}: CategoryShellProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

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
    <>
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
    </>
  );
}