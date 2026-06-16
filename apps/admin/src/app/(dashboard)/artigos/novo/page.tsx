import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { listArticleCategories } from '@/lib/api/article-categories';
import { listContentClusters } from '@/lib/api/content-clusters';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Novo artigo', brand),
};

export default async function NovoArtigoPage(): Promise<React.JSX.Element> {
  const [categories, clustersResponse] = await Promise.all([
    listArticleCategories(),
    listContentClusters(),
  ]);

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
        <ArticleForm
          mode="create"
          categories={categories}
          clusters={clustersResponse.items.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
          }))}
        />
      </AdminPageCard>
    </>
  );
}
