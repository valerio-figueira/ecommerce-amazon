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
  const items = await listAdminCollections();

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
        <CollectionListManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
