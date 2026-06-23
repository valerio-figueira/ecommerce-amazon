import { buildPageCanonical } from '@ecommerce-amazon/shared/seo';

import { PageRenderer } from '@/components/cms/PageRenderer';
import { ContactHomeSection } from '@/components/contact/ContactHomeSection';
import { HomePreparingFallback } from '@/components/cms/HomePreparingFallback';
import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { getHomeLayout } from '@/lib/api/cached-fetchers';
import { fetchInstitutionalContactPage } from '@/lib/api/institutional';
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
  const [layout, contactContent] = await Promise.all([
    getHomeLayout(),
    fetchInstitutionalContactPage(),
  ]);

  if (!layout) {
    return <HomePreparingFallback />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      <SiteJsonLd />
      <PageRenderer layout={layout} />
      <ContactHomeSection content={contactContent} />
    </main>
  );
}
