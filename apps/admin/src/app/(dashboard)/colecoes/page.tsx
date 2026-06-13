import { Layers } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Coleções — Vitrine CMS',
};

export default function ColecoesPage() {
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
        <AdminEmptyState
          icon={Layers}
          title="Coleções curadas em breve"
          hint="Monte vitrines temáticas em /c/[slug] com produtos selecionados manualmente."
        />
      </AdminPageCard>
    </>
  );
}
