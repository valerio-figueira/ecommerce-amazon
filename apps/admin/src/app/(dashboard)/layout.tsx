import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/AdminShell';
import { ADMIN_SESSION_COOKIE, getSessionFromCookie } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSessionFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  return (
    <AdminShell session={session} initialTitle="Painel">
      {children}
    </AdminShell>
  );
}
