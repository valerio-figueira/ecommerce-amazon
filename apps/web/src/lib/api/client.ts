import type { z } from 'zod';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

export function getApiUrl(): string {
  return API_URL;
}

export async function fetchPageLayout(slug: string): Promise<unknown> {
  const response = await fetch(`${API_URL}/pages/${encodeURIComponent(slug)}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: /pages/${slug}`);
  }

  return response.json();
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { sessionId?: string },
): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (init?.sessionId) {
    headers.set('x-session-id', init.sessionId);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    next: init?.method === undefined ? { revalidate: 60 } : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

export async function apiFetchParsed<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit & { sessionId?: string },
): Promise<T> {
  const data = await apiFetch(path, init);
  return schema.parse(data);
}
