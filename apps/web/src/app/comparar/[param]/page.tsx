import { notFound, permanentRedirect } from 'next/navigation';
import Script from 'next/script';

import {
  buildComparisonPageJsonLd,
  buildNotFoundMetadata,
  buildPageCanonical,
} from '@ecommerce-amazon/shared/seo';
import { isComparisonShareToken } from '@ecommerce-amazon/shared/comparison';

import { CopyComparisonLinkButton } from '@/components/comparison/CopyComparisonLinkButton';
import { StandaloneComparisonTable } from '@/components/comparison/StandaloneComparisonTable';
import { ProductSimilarCarousel } from '@/components/product/ProductSimilarCarousel';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { getComparison } from '@/lib/api/cached-fetchers';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

function buildComparisonDisplayTitle(productTitles: string[]): string {
  if (productTitles.length === 0) return 'Comparativo';
  if (productTitles.length === 1) return productTitles[0]!;
  if (productTitles.length === 2) {
    return `${productTitles[0]} vs ${productTitles[1]}`;
  }
  return `${productTitles[0]} vs ${productTitles[1]} vs ${productTitles[2]}`;
}

function buildComparisonTitle(productTitles: string[], brandName: string): string {
  if (productTitles.length === 0) return `Comparativo | ${brandName}`;
  if (productTitles.length === 1) return `${productTitles[0]} | ${brandName}`;
  if (productTitles.length === 2) {
    return `${productTitles[0]} vs ${productTitles[1]} | ${brandName}`;
  }
  return `${productTitles[0]} vs ${productTitles[1]} vs ${productTitles[2]} | ${brandName}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ param: string }>;
}): Promise<import('next').Metadata> {
  const { param } = await params;
  try {
    const data = await getComparison(param);
    if (!data) {
      return buildNotFoundMetadata('Comparativo não encontrado');
    }
    const brand = getServerBrandConfig();
    const title =
      data.seoTitle ??
      buildComparisonTitle(
        data.products.map((product) => product.title),
        brand.name,
      );
    const description = data.seoDescription ?? data.editorialIntro.slice(0, 160);
    const canonicalPath = data.canonicalPath;
    const images = data.products
      .map((product) => product.images[0] ?? product.imageUrl)
      .filter((url): url is string => Boolean(url));

    return {
      title,
      description,
      alternates: { canonical: buildPageCanonical(canonicalPath, brand) },
      ...(data.status === 'draft'
        ? { robots: { index: false, follow: true } }
        : { robots: { index: true, follow: true } }),
      openGraph: {
        title,
        description,
        url: buildPageCanonical(canonicalPath, brand),
        ...(images.length > 0 ? { images: images.map((url) => ({ url })) } : {}),
      },
    };
  } catch {
    return buildNotFoundMetadata('Comparativo não encontrado');
  }
}

export default async function ComparePersistedPage({
  params,
}: {
  params: Promise<{ param: string }>;
}): Promise<React.JSX.Element> {
  const { param } = await params;

  const data = await getComparison(param);
  if (!data) {
    notFound();
  }

  if (data.status === 'published' && data.slug && isComparisonShareToken(param)) {
    permanentRedirect(`/comparar/${data.slug}`);
  }

  const slugs = data.products.map((product) => product.slug);
  const brand = getServerBrandConfig();
  const siteBaseUrl = getSiteBaseUrl();
  const productTitles = data.products.map((product) => product.title);
  const displayTitle = data.seoTitle ?? buildComparisonDisplayTitle(productTitles);
  const pageTitle =
    data.seoTitle ??
    buildComparisonTitle(productTitles, brand.name);
  const pageUrl = `${siteBaseUrl}${data.canonicalPath}`;
  const jsonLd = buildComparisonPageJsonLd({
    siteBaseUrl,
    canonicalPath: data.canonicalPath,
    title: pageTitle,
    description: (data.seoDescription ?? data.editorialIntro).slice(0, 200),
    products: data.products.map((product) => ({
      slug: product.slug,
      title: product.title,
      ...(product.images[0] ?? product.imageUrl
        ? { imageUrl: product.images[0] ?? product.imageUrl }
        : {}),
    })),
  });

  const comparisonSlug =
    data.status === 'published' && data.slug ? data.slug : undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <Script
        id="comparison-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <header className="mb-8 space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{displayTitle}</h1>
          <div className="prose prose-neutral max-w-none whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-base">
            {data.editorialIntro}
          </div>
          <CopyComparisonLinkButton url={pageUrl} />
        </header>

        <section aria-label="Tabela comparativa" className="min-w-0">
          <StandaloneComparisonTable
            slugs={slugs}
            products={data.products}
            comparisonSlug={comparisonSlug}
          />
        </section>
      </div>

      {data.relatedProducts && data.relatedProducts.length >= 3 ? (
        <div className="mt-10">
          <ProductSimilarCarousel
            products={data.relatedProducts}
            categorySlug={data.categorySlug}
            categoryLabel={data.categoryLabel}
            clickOrigin="similar"
            placement={ClickPlacement.COMPARISON_RELATED}
          />
        </div>
      ) : null}
    </main>
  );
}
