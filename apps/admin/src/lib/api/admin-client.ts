'use client';

let logoutInProgress = false;

export async function adminClientFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
  });

  if (response.status === 401 && !logoutInProgress) {
    logoutInProgress = true;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.assign('/login?reason=session_expired');
    }
  }

  return response;
}

export async function adminClientJson(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await adminClientFetch(path, init);

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}
