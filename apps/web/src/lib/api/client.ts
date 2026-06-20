import { z } from 'zod';

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
    next: { revalidate: 60 },
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

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchInit,
    headers,
    next: fetchInit.method === undefined ? (next ?? { revalidate: 60 }) : undefined,
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
