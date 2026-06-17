import { ADMIN_SESSION_COOKIE, getApiUrl, type AdminSession } from './constants';

export type SessionConfirmResult =
  | { status: 'ok'; session: AdminSession }
  | { status: 'unauthorized' }
  | { status: 'unavailable' };

function parseSessionPayload(payload: unknown): AdminSession | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  if (!('id' in payload) || !('email' in payload) || !('name' in payload)) {
    return null;
  }

  const id = payload.id;
  const email = payload.email;
  const name = payload.name;

  if (typeof id !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
    return null;
  }

  return { id, email, name };
}

export async function confirmSessionWithApi(token: string): Promise<SessionConfirmResult> {
  try {
    const response = await fetch(`${getApiUrl()}/admin/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (response.status === 401) {
      return { status: 'unauthorized' };
    }

    if (!response.ok) {
      return { status: 'unavailable' };
    }

    const payload: unknown = await response.json();
    const session = parseSessionPayload(payload);
    if (!session) {
      return { status: 'unavailable' };
    }

    return { status: 'ok', session };
  } catch {
    return { status: 'unavailable' };
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function getSessionCookieClearOptions() {
  return {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  };
}

export { ADMIN_SESSION_COOKIE };
