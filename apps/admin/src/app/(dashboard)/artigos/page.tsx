import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleListManager } from '@/components/articles/ArticleListManager';
import { listAdminArticles } from '@/lib/api/articles';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();
const DEFAULT_PAGE_SIZE = 12;

export const metadata = {
  title: formatAdminPageTitle('Artigos', brand),
};

export default async function ArtigosPage(): Promise<React.JSX.Element> {
  let initialData: Awaited<ReturnType<typeof listAdminArticles>> | null = null;
  let apiUnavailable = false;

  try {
    initialData = await listAdminArticles({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  } catch {
    apiUnavailable = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Artigos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos' },
        ]}
      />
      <AdminPageCard>
        {apiUnavailable ? (
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não foi possível carregar os artigos. Verifique se a API está em execução e tente
            atualizar a página.
          </div>
        ) : initialData ? (
          <ArticleListManager initialData={initialData} />
        ) : null}
      </AdminPageCard>
    </>
  );
}
