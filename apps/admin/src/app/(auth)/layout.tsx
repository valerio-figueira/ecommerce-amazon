import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, getSessionFromCookie } from '@/lib/auth/session';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSessionFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (session) {
    redirect('/');
  }

  return <div className="admin-login-page">{children}</div>;
}
