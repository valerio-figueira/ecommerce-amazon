import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AutoLinkListManager } from '@/components/auto-links/AutoLinkListManager';
import { listAutoLinks } from '@/lib/api/auto-links';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Auto-Links', brand),
};

export default async function AutoLinksPage(): Promise<React.JSX.Element> {
  const initialData = await listAutoLinks({ page: 1, limit: 20 });

  return (
    <>
      <AdminPageHeader
        title="Auto-Links"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Auto-Links' },
        ]}
      />
      <AdminPageCard transparent>
        <AutoLinkListManager initialData={initialData} />
      </AdminPageCard>
    </>
  );
}
