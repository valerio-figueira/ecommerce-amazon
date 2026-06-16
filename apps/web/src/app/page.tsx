import { buildPageCanonical } from '@ecommerce-amazon/shared/seo';
import { pageLayoutDeliverySchema, type PageLayoutDeliveryDto } from '@ecommerce-amazon/shared/cms';

import { PageRenderer } from '@/components/cms/PageRenderer';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { fetchPageLayoutOrNull } from '@/lib/api/safe-fetch';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

async function getHomeLayout(): Promise<PageLayoutDeliveryDto | null> {
  const data = await fetchPageLayoutOrNull('home');
  if (!data) {
    return null;
  }
  return pageLayoutDeliverySchema.parse(data);
}

export async function generateMetadata(): Promise<import('next').Metadata> {
  const layout = await getHomeLayout();
  const siteBaseUrl = getSiteBaseUrl();
  const brand = getServerBrandConfig();

  return {
    title: layout?.seoTitle ?? layout?.title ?? brand.tagline,
    description:
      layout?.seoDescription ??
      'Descubra ofertas selecionadas com histórico de preços e alertas.',
    alternates: {
      canonical: buildPageCanonical('/', brand),
    },
    openGraph: {
      title: layout?.seoTitle ?? layout?.title ?? brand.tagline,
      description:
        layout?.seoDescription ??
        'Descubra ofertas selecionadas com histórico de preços e alertas.',
      url: siteBaseUrl,
    },
  };
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const layout = await getHomeLayout();

  if (!layout) {
    const brand = getServerBrandConfig();

    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <SiteJsonLd />
        <h1 className="text-2xl font-bold">{brand.name}</h1>
        <p className="mt-2 text-neutral-600">
          Layout não encontrado. Execute <code>npm run db:setup</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      <SiteJsonLd />
      <PageRenderer layout={layout} />
    </main>
  );
}
