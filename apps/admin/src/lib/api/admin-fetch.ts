import { cookies } from 'next/headers';
import type { z } from 'zod';

import { verifySessionToken } from '@/lib/auth/session';
import { ADMIN_SESSION_COOKIE, getApiUrl } from '@/lib/auth/constants';
import { UnauthorizedError, ServiceUnavailableError } from '@/lib/api/admin-errors';

export type AdminFetchOptions = {
  method?: string;
  body?: unknown;
};

function readErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'string') return error;
  }
  return null;
}

export async function adminFetch(path: string, options: AdminFetchOptions = {}): Promise<unknown> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    throw new UnauthorizedError();
  }

  const session = await verifySessionToken(token);
  if (!session) {
    throw new UnauthorizedError();
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    cache: 'no-store',
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, init);
  } catch {
    throw new ServiceUnavailableError();
  }

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (response.status === 503) {
    throw new ServiceUnavailableError();
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload) ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

export async function adminFetchParsed<T>(
  path: string,
  schema: z.ZodType<T>,
  options: AdminFetchOptions = {},
): Promise<T> {
  const data = await adminFetch(path, options);
  return schema.parse(data);
}
