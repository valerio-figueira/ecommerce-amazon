import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleCategoryListManager } from '@/components/article-categories/ArticleCategoryListManager';
import { listArticleCategories } from '@/lib/api/article-categories';

export const metadata = {
  title: 'Categorias de artigos — Vitrine CMS',
};

export default async function ArtigoCategoriasPage(): Promise<React.JSX.Element> {
  const items = await listArticleCategories();

  return (
    <>
      <AdminPageHeader
        title="Categorias de artigos"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos', href: '/artigos' },
          { label: 'Categorias' },
        ]}
      />
      <AdminPageCard transparent>
        <ArticleCategoryListManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
