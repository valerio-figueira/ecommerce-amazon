import { Package } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Produtos — Vitrine CMS',
};

export default function ProdutosPage() {
  return (
    <>
      <AdminPageHeader
        title="Produtos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Produtos' },
        ]}
      />
      <AdminPageCard transparent>
        <AdminEmptyState
          icon={Package}
          title="Catálogo gerenciado pelos workers"
          hint="Produtos são sincronizados via pipelines A e B. A curadoria editorial virá nesta área."
        />
      </AdminPageCard>
    </>
  );
}
