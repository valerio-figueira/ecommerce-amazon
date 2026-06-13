import { notFound } from 'next/navigation';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CMSBlockOrderManager } from '@/components/cms/CMSBlockOrderManager';
import { getAdminPageLayout } from '@/lib/api/cms-pages';

type PageEditorProps = {
  params: Promise<{ slug: string }>;
};

export default async function PageEditorPage({ params }: PageEditorProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  let layout: Awaited<ReturnType<typeof getAdminPageLayout>>;
  try {
    layout = await getAdminPageLayout(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={layout.title}
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Páginas', href: '/paginas' },
          { label: layout.title },
        ]}
      />
      <AdminPageCard>
        <CMSBlockOrderManager
          slug={slug}
          pageTitle={layout.title}
          initialBlocks={layout.blocks}
        />
      </AdminPageCard>
    </>
  );
}
