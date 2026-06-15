import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  buildCuratedCollectionBreadcrumbJsonLd,
  buildCuratedCollectionJsonLd,
} from '@ecommerce-amazon/shared/seo';

import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { fetchCuratedCollection } from '@/lib/api/collections';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

async function getCollection(slug: string) {
  return fetchCuratedCollection(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) {
    return { title: 'Coleção não encontrada' };
  }

  return {
    title: `${data.collection.title} | Coleções`,
    description: data.collection.description,
    alternates: {
      canonical: `${getSiteBaseUrl()}/colecoes/${data.collection.slug}`,
    },
  };
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
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const data = await getCollection(slug);

  if (!data) {
    notFound();
  }

  const { collection, products } = data;
  const siteBaseUrl = getSiteBaseUrl();
  const jsonLd = buildCuratedCollectionJsonLd({
    siteBaseUrl,
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    productCount: products.length,
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
          Atualizado em {formatUpdatedAt(collection.updatedAt)}
        </p>
      </header>

      <hr className="border-neutral-100" />

      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute -left-3 -top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-md">
                {index + 1}
              </div>
              <ProductCard
                product={product}
                clickOrigin="coleção"
                placement={ClickPlacement.COLLECTION_PAGE}
                collectionId={collection.id}
                utmDefaults={collection.utmDefaults}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
