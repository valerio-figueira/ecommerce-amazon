import { Settings } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Configurações — Vitrine CMS',
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
