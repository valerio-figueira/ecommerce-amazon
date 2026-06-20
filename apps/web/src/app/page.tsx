import { buildPageCanonical } from '@ecommerce-amazon/shared/seo';

import { PageRenderer } from '@/components/cms/PageRenderer';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { getHomeLayout } from '@/lib/api/cached-fetchers';
import { getServerBrandConfig, getSiteBaseUrl } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<import('next').Metadata> {
  const layout = await getHomeLayout();
  const siteBaseUrl = getSiteBaseUrl();
  const brand = getServerBrandConfig();

  return {
    title: layout?.seoTitle ?? layout?.title ?? brand.tagline,
    description:
      layout?.seoDescription ?? 'Descubra ofertas selecionadas com histórico de preços e alertas.',
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
