import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ComparisonListManager } from '@/components/comparisons/ComparisonListManager';
import { listAdminComparisons } from '@/lib/api/comparisons';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Comparações', brand),
};

export default async function ComparacoesPage(): Promise<React.JSX.Element> {
  let items: Awaited<ReturnType<typeof listAdminComparisons>> = [];
  let apiUnavailable = false;

  try {
    items = await listAdminComparisons();
  } catch {
    apiUnavailable = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Comparações"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Comparações' },
        ]}
      />
      <AdminPageCard transparent>
        {apiUnavailable ? (
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não foi possível carregar as comparações. Verifique se a API está em execução e tente
            atualizar a página.
          </div>
        ) : (
          <ComparisonListManager initialItems={items} />
        )}
      </AdminPageCard>
    </>
  );
}
