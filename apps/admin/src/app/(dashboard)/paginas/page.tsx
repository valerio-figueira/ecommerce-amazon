import { FileStack } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Páginas — Vitrine CMS',
};

export default function PaginasPage() {
  return (
    <>
      <AdminPageHeader
        title="Páginas"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Páginas' },
        ]}
      />
      <AdminPageCard transparent>
        <AdminEmptyState
          icon={FileStack}
          title="Editor de páginas em breve"
          hint="Na fase seguinte você poderá gerenciar blocos CMS, reordenar a home e publicar rascunhos."
        />
      </AdminPageCard>
    </>
  );
}
