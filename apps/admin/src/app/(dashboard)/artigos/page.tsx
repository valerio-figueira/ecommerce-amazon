import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleListManager } from '@/components/articles/ArticleListManager';
import { listAdminArticles } from '@/lib/api/articles';

export const metadata = {
  title: 'Artigos — Vitrine CMS',
};

export default async function ArtigosPage() {
  const items = await listAdminArticles();

  return (
    <>
      <AdminPageHeader
        title="Artigos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos' },
        ]}
      />
      <AdminPageCard>
        <ArticleListManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
