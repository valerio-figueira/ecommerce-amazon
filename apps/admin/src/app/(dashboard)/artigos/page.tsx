import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ArticleListManager } from '@/components/articles/ArticleListManager';
import { listAdminArticles } from '@/lib/api/articles';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Artigos', brand),
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
