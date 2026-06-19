import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProductListManager } from '@/components/products/ProductListManager';
import { AdminToastOnMount } from '@/components/ui/admin-toast';
import { listAdminProducts } from '@/lib/api/admin-products';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();
const DEFAULT_PAGE_SIZE = 12;

export const metadata = {
  title: formatAdminPageTitle('Produtos', brand),
};

export default async function ProdutosPage(): Promise<React.JSX.Element> {
  let initialData: Awaited<ReturnType<typeof listAdminProducts>> | null = null;
  let error: string | null = null;

  try {
    initialData = await listAdminProducts({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : 'Erro ao carregar produtos';
  }

  return (
    <>
      {error ? <AdminToastOnMount message={error} variant="error" /> : null}
      <AdminPageHeader
        title="Produtos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Produtos' },
        ]}
      />
      <AdminPageCard>
        {initialData ? <ProductListManager initialData={initialData} /> : null}
      </AdminPageCard>
    </>
  );
}
