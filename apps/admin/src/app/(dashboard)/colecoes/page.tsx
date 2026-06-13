import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CollectionListManager } from '@/components/collections/CollectionListManager';
import { listAdminCollections } from '@/lib/api/collections';

export const metadata = {
  title: 'Coleções — Vitrine CMS',
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
