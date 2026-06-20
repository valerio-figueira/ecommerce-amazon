import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { CategoryTreeManager } from '@/components/categories/CategoryTreeManager';
import { listAdminCategories } from '@/lib/api/categories';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Categorias', brand),
};

export default async function CategoriasPage(): Promise<React.JSX.Element> {
  const items = await listAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Categorias"
        breadcrumbs={[{ label: 'Painel', href: '/' }, { label: 'Categorias' }]}
      />
      <AdminPageCard transparent>
        <CategoryTreeManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
