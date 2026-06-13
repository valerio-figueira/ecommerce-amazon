import { Newspaper } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export const metadata = {
  title: 'Artigos — Vitrine CMS',
};

export default function ArtigosPage() {
  return (
    <>
      <AdminPageHeader
        title="Artigos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos' },
        ]}
      />
      <AdminPageCard transparent>
        <AdminEmptyState
          icon={Newspaper}
          title="Hub de conteúdo em breve"
          hint="Guides, reviews e comparativos editoriais serão criados aqui com embeds dinâmicos de produtos."
        />
      </AdminPageCard>
    </>
  );
}
