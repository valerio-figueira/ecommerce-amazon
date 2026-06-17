import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CollectionListManager } from '@/components/collections/CollectionListManager';
import { listAdminCollections } from '@/lib/api/collections';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Coleções', brand),
};

export default async function ColecoesPage(): Promise<React.JSX.Element> {
  let items: Awaited<ReturnType<typeof listAdminCollections>> = [];
  let apiUnavailable = false;

  try {
    items = await listAdminCollections();
  } catch {
    apiUnavailable = true;
  }

  return (
    <>
      <AdminPageHeader
        title="Coleções"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Coleções' },
        ]}
      />
      <AdminPageCard transparent>
        {apiUnavailable ? (
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não foi possível carregar as coleções. Verifique se a API está em execução e tente
            atualizar a página.
          </div>
        ) : (
          <CollectionListManager initialItems={items} />
        )}
      </AdminPageCard>
    </>
  );
}
