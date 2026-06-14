import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleForm } from '@/components/articles/ArticleForm';

export const metadata = {
  title: 'Novo artigo — Vitrine CMS',
};

export default function NovoArtigoPage() {
  return (
    <>
      <AdminPageHeader
        title="Novo artigo"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos', href: '/artigos' },
          { label: 'Novo' },
        ]}
      />
      <AdminPageCard>
        <ArticleForm mode="create" />
      </AdminPageCard>
    </>
  );
}
