import { notFound } from 'next/navigation';

import { AboutPageEditor } from '@/components/about/AboutPageEditor';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CMSBlockOrderManager } from '@/components/cms/CMSBlockOrderManager';
import { getAdminInstitutionalPage } from '@/lib/api/institutional-pages';
import { getAdminPageLayout, listAdminPages } from '@/lib/api/cms-pages';
import { getSiteSettings } from '@/lib/api/site-settings';
import { PageKind } from '@ecommerce-amazon/domain';

type PageEditorProps = {
  params: Promise<{ slug: string }>;
};

export default async function PageEditorPage({
  params,
}: PageEditorProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  let pages: Awaited<ReturnType<typeof listAdminPages>> = [];
  try {
    pages = await listAdminPages();
  } catch {
    notFound();
  }

  const pageSummary = pages.find((page) => page.slug === slug);
  if (!pageSummary) {
    notFound();
  }

  if (pageSummary.pageKind === PageKind.INSTITUTIONAL) {
    let institutionalPage: Awaited<ReturnType<typeof getAdminInstitutionalPage>>;
    try {
      institutionalPage = await getAdminInstitutionalPage(slug);
    } catch {
      notFound();
    }

    return (
      <>
        <AdminPageHeader
          title={pageSummary.title}
          breadcrumbs={[
            { label: 'Painel', href: '/' },
            { label: 'Páginas', href: '/paginas' },
            { label: pageSummary.title },
          ]}
        />
        <AdminPageCard>
          <AboutPageEditor
            slug={slug}
            pageTitle={pageSummary.title}
            initialData={institutionalPage}
          />
        </AdminPageCard>
      </>
    );
  }

  let layout: Awaited<ReturnType<typeof getAdminPageLayout>>;
  let publishConfirmRequired = false;
  try {
    const [layoutResult, siteSettings] = await Promise.all([
      getAdminPageLayout(slug),
      getSiteSettings(),
    ]);
    layout = layoutResult;
    publishConfirmRequired = siteSettings.cms.publishConfirmRequired;
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
          publishConfirmRequired={publishConfirmRequired}
        />
      </AdminPageCard>
    </>
  );
}
