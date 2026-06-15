import Link from 'next/link';
import { notFound } from 'next/navigation';

import { resolveProductCanonicalUrl, resolveProductMetaDescription, resolveProductMetaTitle } from '@ecommerce-amazon/shared/seo';

import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductDetailAnalysis } from '@/components/product/ProductDetailAnalysis';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductRating } from '@/components/product/ProductRating';
import { ProductSimilarCarousel } from '@/components/product/ProductSimilarCarousel';
import { ProductSpecsTable } from '@/components/product/ProductSpecsTable';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { apiFetchParsed } from '@/lib/api/client';
import { productDetailSchema, type ProductDetailDto, type ProductListItemDto } from '@/lib/api/schemas';
import { marketplaceLabel } from '@/lib/format';
import { getSiteBaseUrl } from '@/lib/site-url';

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

  const siteBaseUrl = getSiteBaseUrl();
  const canonical = resolveProductCanonicalUrl(product.slug, siteBaseUrl, product.canonicalUrl);

  return {
    title: resolveProductMetaTitle(product.title, product.metaTitle),
    description: resolveProductMetaDescription(product.title, product.metaDescription),
    alternates: {
      canonical,
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
  const similarProducts: ProductListItemDto[] = product.similarProducts;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ProductJsonLd product={product} siteBaseUrl={siteBaseUrl} />
      <nav className="mb-6 text-sm text-neutral-500">
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
        <div className="flex flex-col justify-center gap-5">
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
          <AffiliateGoLink
            productId={product.id}
            slug={product.slug}
            origin="detalhe"
            variant="primary"
            className="px-6 py-3 text-sm md:w-auto"
          >
            Ver preço na {marketplaceLabel(product.marketplace)}
          </AffiliateGoLink>
        </div>
      </div>
      <ProductDetailAnalysis pros={product.pros} cons={product.cons} />
      <ProductSpecsTable specs={product.specs} />
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
    </main>
  );
}
