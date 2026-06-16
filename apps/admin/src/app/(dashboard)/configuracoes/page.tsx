import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { Settings } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Configurações', brand),
};

export default function ConfiguracoesPage() {
  return (
    <>
      <AdminPageHeader
        title="Configurações"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Configurações' },
        ]}
      />
      <AdminPageCard transparent>
        <AdminEmptyState
          icon={Settings}
          title="Configurações operacionais em breve"
          hint="Contas de afiliado, operadores e preferências do CMS serão centralizadas nesta área."
        />
      </AdminPageCard>
    </>
  );
}
