import { pageLayoutDeliverySchema, type PageLayoutDeliveryDto } from '@ecommerce-amazon/shared/cms';

import { PageRenderer } from '@/components/cms/PageRenderer';
import { fetchPageLayout } from '@/lib/api/client';
import { getSiteBaseUrl } from '@/lib/site-url';

async function getHomeLayout(): Promise<PageLayoutDeliveryDto | null> {
  try {
    const data = await fetchPageLayout('home');
    return pageLayoutDeliverySchema.parse(data);
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<import('next').Metadata> {
  const layout = await getHomeLayout();
  const siteBaseUrl = getSiteBaseUrl();

  return {
    title: layout?.seoTitle ?? layout?.title ?? 'Vitrine — Curadoria inteligente',
    description:
      layout?.seoDescription ??
      'Descubra ofertas selecionadas com histórico de preços e alertas.',
    alternates: {
      canonical: siteBaseUrl,
    },
  };
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const layout = await getHomeLayout();

  if (!layout) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Vitrine</h1>
        <p className="mt-2 text-neutral-600">
          Layout não encontrado. Execute <code>npm run db:setup</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      <PageRenderer layout={layout} />
    </main>
  );
}
