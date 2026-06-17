import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OperationalSettingsManager } from '@/components/settings/OperationalSettingsManager';
import { listAffiliateAccounts } from '@/lib/api/affiliate-accounts';
import { getOperationalStatus } from '@/lib/api/operational-status';
import { listOperators } from '@/lib/api/operators';
import { getOperatorProfile } from '@/lib/api/profile';
import { getSiteSettings } from '@/lib/api/site-settings';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Configurações', brand),
};

export default async function ConfiguracoesPage(): Promise<React.JSX.Element> {
  const profile = await getOperatorProfile();
  const [affiliateAccounts, siteSettings, operationalStatus] = await Promise.all([
    listAffiliateAccounts(),
    getSiteSettings(),
    getOperationalStatus(),
  ]);

  const operators = profile.role === 'admin' ? await listOperators() : [];

  return (
    <>
      <AdminPageHeader
        title="Configurações"
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Configurações' },
        ]}
      />
      <AdminPageCard transparent>
        <OperationalSettingsManager
          profile={profile}
          affiliateAccounts={affiliateAccounts}
          siteSettings={siteSettings}
          operationalStatus={operationalStatus}
          operators={operators}
        />
      </AdminPageCard>
    </>
  );
}
