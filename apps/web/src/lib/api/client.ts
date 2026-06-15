import type { z } from 'zod';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, path: string) {
    super(`API error ${status}: ${path}`);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function getApiUrl(): string {
  return API_URL;
}

export async function fetchPageLayout(slug: string): Promise<unknown> {
  const path = `/pages/${slug}`;
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ApiError(response.status, path);
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
    throw new ApiError(response.status, path);
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
