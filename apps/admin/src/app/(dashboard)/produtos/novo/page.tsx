import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProductForm } from '@/components/products/ProductForm';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Novo produto', brand),
};

export default function NovoProdutoPage(): React.JSX.Element {
  return (
    <>
      <AdminPageHeader
        title="Novo produto"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          { label: 'Novo produto' },
        ]}
      />
      <AdminPageCard>
        <ProductForm mode="create" />
      </AdminPageCard>
    </>
  );
}
