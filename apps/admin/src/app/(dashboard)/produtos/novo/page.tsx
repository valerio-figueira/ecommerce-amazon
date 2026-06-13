import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProductForm } from '@/components/products/ProductForm';

export const metadata = {
  title: 'Novo produto — Vitrine CMS',
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
