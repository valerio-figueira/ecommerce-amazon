import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { Ticket } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getServerBrandConfig } from '@/lib/brand';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatAdminPageTitle('Cupons', brand),
};

export default function CuponsPage() {
  return (
    <>
      <AdminPageHeader
        title="Cupons"
        breadcrumbs={[{ label: 'Painel', href: '/' }, { label: 'Cupons' }]}
      />
      <AdminPageCard transparent>
        <AdminEmptyState
          icon={Ticket}
          title="Central de cupons em breve"
          hint="Cupons verificados pelo pipeline D aparecerão na vitrine pública após validação."
        />
      </AdminPageCard>
    </>
  );
}
