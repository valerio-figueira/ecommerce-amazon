import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/AdminShell';
import { getOperatorProfile } from '@/lib/api/profile';
import { ADMIN_SESSION_COOKIE, getSessionFromCookie } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSessionFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

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
