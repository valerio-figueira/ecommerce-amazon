import { notFound } from 'next/navigation';
import Script from 'next/script';

import {
  buildComparisonPageJsonLd,
  buildNotFoundMetadata,
  buildPageCanonical,
} from '@ecommerce-amazon/shared/seo';

import { CopyComparisonLinkButton } from '@/components/comparison/CopyComparisonLinkButton';
import { StandaloneComparisonTable } from '@/components/comparison/StandaloneComparisonTable';
import { getComparison } from '@/lib/api/cached-fetchers';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 300;

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
  params: Promise<{ shareToken: string }>;
}): Promise<import('next').Metadata> {
  const { shareToken } = await params;
  try {
    const data = await getComparison(shareToken);
    if (!data) {
      return buildNotFoundMetadata('Comparativo não encontrado');
    }
    const brand = getServerBrandConfig();
    const title = buildComparisonTitle(
      data.products.map((product) => product.title),
      brand.name,
    );
    const description = data.editorialIntro.slice(0, 160);
    const canonicalPath = `/comparar/${shareToken}`;
    const images = data.products
      .map((product) => product.images[0] ?? product.imageUrl)
      .filter((url): url is string => Boolean(url));

    return {
      title,
      description,
      alternates: { canonical: buildPageCanonical(canonicalPath, brand) },
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
  params: Promise<{ shareToken: string }>;
}): Promise<React.JSX.Element> {
  const { shareToken } = await params;

  const data = await getComparison(shareToken);
  if (!data) {
    notFound();
  }

  const slugs = data.products.map((product) => product.slug);
  const brand = getServerBrandConfig();
  const siteBaseUrl = getSiteBaseUrl();
  const pageTitle = buildComparisonTitle(
    data.products.map((product) => product.title),
    brand.name,
  );
  const pageUrl = `${siteBaseUrl}/comparar/${shareToken}`;
  const jsonLd = buildComparisonPageJsonLd({
    siteBaseUrl,
    shareToken,
    title: pageTitle,
    description: data.editorialIntro.slice(0, 200),
    products: data.products.map((product) => ({
      slug: product.slug,
      title: product.title,
      ...(product.images[0] ?? product.imageUrl
        ? { imageUrl: product.images[0] ?? product.imageUrl }
        : {}),
    })),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <Script
        id="comparison-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{pageTitle}</h1>
        <div className="prose prose-neutral max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-base">
          {data.editorialIntro}
        </div>
        <CopyComparisonLinkButton url={pageUrl} />
      </div>

      <StandaloneComparisonTable slugs={slugs} products={data.products} />
    </main>
  );
}
