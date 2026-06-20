import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import {
  buildCuratedCollectionBreadcrumbJsonLd,
  buildCuratedCollectionJsonLd,
  buildFacetedListingMetadata,
  buildNotFoundMetadata,
  buildPageCanonical,
  parseListingPage,
} from '@ecommerce-amazon/shared/seo';

import { ListingPagination } from '@/components/listing/ListingPagination';
import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { getCollection } from '@/lib/api/cached-fetchers';
import { totalListingPages } from '@/lib/listing';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

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
  const page = parseListingPage(sp);
  const data = await getCollection(slug, page);
  if (!data) {
    return buildNotFoundMetadata('Coleção não encontrada');
  }

  const brand = getServerBrandConfig();
  const canonicalPath = `/colecoes/${data.collection.slug}`;

  return buildFacetedListingMetadata({
    title: data.collection.title,
    description: data.collection.description,
    canonicalPath,
    brand,
    page,
    openGraph: {
      title: data.collection.title,
      description: data.collection.description,
      url: buildPageCanonical(canonicalPath, brand),
      ...(data.collection.coverImageUrl
        ? { images: [{ url: data.collection.coverImageUrl }] }
        : {}),
    },
  });
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function CuratedCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseListingPage(sp);
  const data = await getCollection(slug, page);

  if (!data) {
    notFound();
  }

  const { collection, products, total, pageSize } = data;
  const totalPages = totalListingPages(total, pageSize);
  const rankOffset = (page - 1) * pageSize;
  const siteBaseUrl = getSiteBaseUrl();
  const jsonLd = buildCuratedCollectionJsonLd({
    siteBaseUrl,
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    productCount: total,
    updatedAt: collection.updatedAt,
  });
  const breadcrumbJsonLd = buildCuratedCollectionBreadcrumbJsonLd({
    siteBaseUrl,
    slug: collection.slug,
    title: collection.title,
  });

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="text-sm text-neutral-500">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <span>Coleções</span>
        <span className="mx-2">/</span>
        <span>{collection.title}</span>
      </nav>

      <header className="max-w-3xl space-y-4">
        <span className="inline-block rounded bg-emerald-50 px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600">
          Coleção especializada
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
          {collection.title}
        </h1>
        <p className="text-lg leading-relaxed text-neutral-600">{collection.description}</p>
        <p className="text-sm text-neutral-500">
          {total} produto{total === 1 ? '' : 's'} · Atualizado em{' '}
          {formatUpdatedAt(collection.updatedAt)}
        </p>
      </header>

      <hr className="border-neutral-100" />

      <section className="space-y-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 min-[550px]:grid-cols-3 min-[550px]:gap-4 min-[830px]:grid-cols-4 min-[830px]:gap-6">
            {products.map((product, index) => (
              <div key={product.id} className="relative">
                <div className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white shadow-md md:-left-3 md:-top-3 md:h-7 md:w-7 md:text-xs">
                  {rankOffset + index + 1}
                </div>
                <ProductCard
                  product={product}
                  variant="compact"
                  clickOrigin="coleção"
                  placement={ClickPlacement.COLLECTION_PAGE}
                  collectionId={collection.id}
                  utmDefaults={collection.utmDefaults}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-neutral-500">
            Nenhum produto nesta página.
          </p>
        )}

        <Suspense fallback={null}>
          <ListingPagination page={page} totalPages={totalPages} ariaLabel="Paginação da coleção" />
        </Suspense>
      </section>
    </main>
  );
}
