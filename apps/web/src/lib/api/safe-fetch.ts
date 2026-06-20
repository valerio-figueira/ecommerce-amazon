import { z } from 'zod';

import { apiFetchParsed, fetchPageLayout, isNotFoundError } from './client';

function isBuildPhaseApiUnavailable(error: unknown): boolean {
  if (process.env['NEXT_PHASE'] !== 'phase-production-build') {
    return false;
  }
  return error instanceof TypeError && error.message === 'fetch failed';
}

export async function fetchOrNotFound<TOutput>(
  path: string,
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  init?: RequestInit & { sessionId?: string },
): Promise<TOutput | null> {
  try {
    return await apiFetchParsed(path, schema, init);
  } catch (error) {
    if (isNotFoundError(error) || isBuildPhaseApiUnavailable(error)) {
      return null;
    }
    throw error;
  }
}

export async function fetchPageLayoutOrNull(slug: string): Promise<unknown> {
  try {
    return await fetchPageLayout(slug);
  } catch (error) {
    if (isNotFoundError(error) || isBuildPhaseApiUnavailable(error)) {
      return null;
    }
    throw error;
  }
}
