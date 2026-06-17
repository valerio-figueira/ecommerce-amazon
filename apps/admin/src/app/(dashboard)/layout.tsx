import { AdminShell } from '@/components/admin/AdminShell';
import { getOperatorProfile } from '@/lib/api/profile';
import { requireConfirmedSession } from '@/lib/auth/require-confirmed-session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireConfirmedSession();

  let avatarUrl: string | null = null;
  let isManagedAvatar = false;

  try {
    const profile = await getOperatorProfile();
    avatarUrl = profile.avatarUrl;
    isManagedAvatar = profile.isManagedAvatar;
  } catch {
    // Header falls back to initials when profile fetch fails.
  }

  return (
    <AdminShell
      session={session}
      avatarUrl={avatarUrl}
      isManagedAvatar={isManagedAvatar}
      initialTitle="Painel"
    >
      {children}
    </AdminShell>
  );
}
