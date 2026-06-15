import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, getApiUrl } from '@/lib/auth/constants';

function readErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'string') return error;
  }
  return null;
}

export async function adminFetchMultipart(path: string, formData: FormData): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload) ?? `Request failed (${response.status})`);
  }

  return response.json();
}
