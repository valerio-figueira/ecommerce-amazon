import { redirect } from 'next/navigation';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OperatorProfilePage } from '@/components/profile/OperatorProfilePage';
import { getOperatorProfile } from '@/lib/api/profile';

export default async function PerfilPage(): Promise<React.JSX.Element> {
  let profile;
  try {
    profile = await getOperatorProfile();
  } catch {
    redirect('/login');
  }

  return (
    <>
      <AdminPageHeader
        title="Meu perfil"
        breadcrumbs={[{ label: 'Painel', href: '/' }, { label: 'Meu perfil' }]}
      />
      <AdminPageCard transparent className="admin-profile-page-card">
        <OperatorProfilePage profile={profile} />
      </AdminPageCard>
    </>
  );
}
