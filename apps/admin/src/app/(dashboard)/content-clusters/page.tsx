import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ContentClusterListManager } from '@/components/content-clusters/ContentClusterListManager';
import { listContentClusters } from '@/lib/api/content-clusters';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Clusters de conteúdo', brand),
};

export default async function ContentClustersPage(): Promise<React.JSX.Element> {
  const { items } = await listContentClusters();

  return (
    <>
      <AdminPageHeader
        title="Clusters de conteúdo"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Artigos', href: '/artigos' },
          { label: 'Clusters' },
        ]}
      />
      <AdminPageCard transparent>
        <ContentClusterListManager initialItems={items} />
      </AdminPageCard>
    </>
  );
}
