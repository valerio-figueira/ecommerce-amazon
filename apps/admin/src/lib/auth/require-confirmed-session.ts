import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, getSessionFromCookie } from '@/lib/auth/session';
import {
  confirmSessionWithApi,
  getSessionCookieClearOptions,
} from '@/lib/auth/session-guard';

export type GuardedSession = {
  id: string;
  email: string;
  name: string;
};

export async function requireConfirmedSession(): Promise<GuardedSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const localSession = await getSessionFromCookie(token);

  if (!localSession || !token) {
    redirect('/login');
  }

  const confirmed = await confirmSessionWithApi(token);

  if (confirmed.status === 'unauthorized') {
    cookieStore.set(ADMIN_SESSION_COOKIE, '', getSessionCookieClearOptions());
    redirect('/login');
  }

  if (confirmed.status === 'unavailable') {
    redirect('/servico-indisponivel');
  }

  return confirmed.session;
}
