import { z } from 'zod';

import { PUBLIC_WEB_CACHE_TAGS } from '@ecommerce-amazon/shared/cache';

import { resolveApiBaseUrl } from './resolve-api-base-url';

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
  return resolveApiBaseUrl();
}

export async function fetchPageLayout(slug: string): Promise<unknown> {
  const path = `/pages/${slug}`;
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60, tags: [PUBLIC_WEB_CACHE_TAGS.siteSettings] },
  });

  if (!response.ok) {
    throw new ApiError(response.status, path);
  }

  return response.json();
}

type ApiFetchInit = RequestInit & {
  sessionId?: string;
  next?: RequestInit extends { next?: infer N } ? N : never;
};

function parseWithSchema<TOutput>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  data: unknown,
): TOutput {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data;
}

export async function apiFetch(path: string, init?: ApiFetchInit): Promise<unknown> {
  const { sessionId, next, ...fetchInit } = init ?? {};
  const headers = new Headers(fetchInit.headers);
  if (fetchInit.body !== undefined && fetchInit.body !== null) {
    headers.set('Content-Type', 'application/json');
  }
  if (sessionId) {
    headers.set('x-session-id', sessionId);
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...fetchInit,
    headers,
    next:
      fetchInit.method === undefined
        ? (next ?? { revalidate: 60, tags: [PUBLIC_WEB_CACHE_TAGS.siteSettings] })
        : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, path);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

export async function apiFetchParsed<TOutput>(
  path: string,
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  init?: ApiFetchInit,
): Promise<TOutput> {
  const data = await apiFetch(path, init);
  return parseWithSchema(schema, data);
}
