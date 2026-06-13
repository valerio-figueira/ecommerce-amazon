import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { apiFetchParsed } from '@/lib/api/client';
import { productDetailSchema, type ProductDetailDto } from '@/lib/api/schemas';
import { marketplaceLabel } from '@/lib/format';
import { buildGoUrl } from '@/lib/go-url';

export const revalidate = 300;

async function getProduct(slug: string): Promise<ProductDetailDto | null> {
  try {
    return await apiFetchParsed(`/products/${slug}`, productDetailSchema);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: 'Produto não encontrado' };
  }

  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.shortDescription ?? product.titleRaw,
    ...(product.canonicalUrl !== undefined
      ? { alternates: { canonical: product.canonicalUrl } }
      : {}),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    notFound();
  }

  const siteBaseUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3001';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ProductJsonLd product={product} siteBaseUrl={siteBaseUrl} />
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <span>{product.title}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] bg-[var(--muted)]">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <MarketplaceBadge marketplace={product.marketplace} />
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
          {product.shortDescription && (
            <p className="text-neutral-600">{product.shortDescription}</p>
          )}
          <p className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Curadoria independente: comparamos ofertas na {marketplaceLabel(product.marketplace)} e
            redirecionamos você para a loja parceira. Não vendemos nem entregamos produtos.
          </p>
          <a
            href={buildGoUrl(product.slug)}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white md:w-auto"
          >
            Ver preço na {marketplaceLabel(product.marketplace)}
          </a>
        </div>
      </div>
      {product.longDescriptionHtml && (
        <section
          className="prose prose-neutral mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: product.longDescriptionHtml }}
        />
      )}
      <p className="mt-8 text-xs text-neutral-500">
        Links comerciais transparentes. Preços podem variar no marketplace parceiro.
      </p>
    </main>
  );
}
