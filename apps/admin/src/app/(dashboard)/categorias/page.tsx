import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CategoryTreeManager } from '@/components/categories/CategoryTreeManager';
import { listAdminCategories } from '@/lib/api/categories';

export const metadata = {
  title: 'Categorias — Vitrine CMS',
};

export default async function CategoriasPage(): Promise<React.JSX.Element> {
  const items = await listAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Categorias"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Categorias' },
        ]}
      />
      <AdminPageCard transparent>
        <CategoryTreeManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
