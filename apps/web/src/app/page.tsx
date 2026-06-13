import { pageLayoutDtoSchema, type PageLayoutDto } from '@ecommerce-amazon/shared/cms';

import { PageRenderer } from '@/components/cms/PageRenderer';
import { apiFetch } from '@/lib/api/client';

async function getHomeLayout(): Promise<PageLayoutDto | null> {
  try {
    const data = await apiFetch('/pages/home');
    return pageLayoutDtoSchema.parse(data);
  } catch {
    return null;
  }
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
