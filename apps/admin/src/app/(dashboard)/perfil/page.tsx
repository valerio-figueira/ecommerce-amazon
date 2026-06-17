import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OperatorProfilePage } from '@/components/profile/OperatorProfilePage';
import { getOperatorProfile } from '@/lib/api/profile';

export default async function PerfilPage(): Promise<React.JSX.Element> {
  let profile;
  let loadFailed = false;

  try {
    profile = await getOperatorProfile();
  } catch {
    loadFailed = true;
  }

  if (loadFailed || !profile) {
    return (
      <>
        <AdminPageHeader
          title="Meu perfil"
          breadcrumbs={[{ label: 'Painel', href: '/' }, { label: 'Meu perfil' }]}
        />
        <AdminPageCard transparent className="admin-profile-page-card">
          <div
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            Não foi possível carregar o perfil. Tente atualizar a página em instantes.
          </div>
        </AdminPageCard>
      </>
    );
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
