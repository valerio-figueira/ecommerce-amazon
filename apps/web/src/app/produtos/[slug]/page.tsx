import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  resolveProductCanonicalUrl,
  resolveProductMetaDescription,
  resolveProductMetaTitle,
  buildNotFoundMetadata,
} from '@ecommerce-amazon/shared/seo';

import { ProductDetailAffiliateCta } from '@/components/product/ProductDetailAffiliateCta';
import { ProductDetailStickyCta } from '@/components/product/ProductDetailStickyCta';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductDetailAnalysis } from '@/components/product/ProductDetailAnalysis';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductRating } from '@/components/product/ProductRating';
import { ProductSimilarCarousel } from '@/components/product/ProductSimilarCarousel';
import { ProductSpecsSections } from '@/components/product/ProductSpecsSections';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { getProduct } from '@/lib/api/cached-fetchers';
import { type ProductListItemDto } from '@/lib/api/schemas';
import { marketplaceLabel } from '@/lib/format';
import { getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return buildNotFoundMetadata('Produto não encontrado');
  }

  const siteBaseUrl = getSiteBaseUrl();
  const canonical = resolveProductCanonicalUrl(product.slug, siteBaseUrl, product.canonicalUrl);
  const title = resolveProductMetaTitle(product.title, product.metaTitle);
  const description = resolveProductMetaDescription(product.title, product.metaDescription);
  const primaryImage = product.images[0];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(primaryImage ? { images: [{ url: primaryImage }] } : {}),
    },
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

  const siteBaseUrl = getSiteBaseUrl();
  const similarProducts: ProductListItemDto[] = product.similarProducts ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-28 md:pb-8">
      <ProductJsonLd product={product} siteBaseUrl={siteBaseUrl} />
      <nav className="mb-6 overflow-x-auto text-sm text-neutral-500 whitespace-nowrap">
        <Link href="/">Home</Link>
        {product.category && (
          <>
            {product.category.breadcrumbs.slice(0, -1).map((crumb) => (
              <span key={crumb.slug}>
                <span className="mx-2">/</span>
                <Link href={`/categorias/${crumb.slug}`}>{crumb.label}</Link>
              </span>
            ))}
            <span className="mx-2">/</span>
            <Link href={`/categorias/${product.category.slug}`}>{product.category.label}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span>{product.title}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImageGallery images={product.images} alt={product.title} />
        <div className="flex flex-col gap-5">
          <MarketplaceBadge marketplace={product.marketplace} />
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
          <PriceDisplay
            price={product.price}
            strikethrough={product.price.strikethrough}
            className="text-sm"
          />
          {product.shortDescription && (
            <p className="text-neutral-600">{product.shortDescription}</p>
          )}
          <p className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Curadoria independente: comparamos ofertas na {marketplaceLabel(product.marketplace)} e
            redirecionamos você para a loja parceira. Não vendemos nem entregamos produtos.
          </p>
          <ProductDetailAffiliateCta
            productId={product.id}
            slug={product.slug}
            marketplace={product.marketplace}
          />
        </div>
      </div>
      <ProductDetailAnalysis pros={product.pros} cons={product.cons} />
      <ProductSpecsSections specGroups={product.specGroups} />
      {product.longDescriptionHtml && (
        <section
          className="prose prose-neutral mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: product.longDescriptionHtml }}
        />
      )}
      <ProductSimilarCarousel
        products={similarProducts}
        categorySlug={product.category?.slug}
        categoryLabel={product.category?.label}
      />
      <p className="mt-8 text-xs text-neutral-500">
        Links comerciais transparentes. Preços podem variar no marketplace parceiro.
      </p>
      <ProductDetailStickyCta
        productId={product.id}
        slug={product.slug}
        marketplace={product.marketplace}
      />
    </main>
  );
}
