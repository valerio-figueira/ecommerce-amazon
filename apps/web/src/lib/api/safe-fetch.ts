import { z } from 'zod';

import { apiFetchParsed, fetchPageLayout, isNotFoundError } from './client';
import { isTransientFetchFailure } from './network-errors';

function isBuildPhaseApiUnavailable(error: unknown): boolean {
  if (process.env['NEXT_PHASE'] !== 'phase-production-build') {
    return false;
  }
  return isTransientFetchFailure(error);
}

function isMissingResource(error: unknown): boolean {
  return (
    isNotFoundError(error) || isBuildPhaseApiUnavailable(error) || isTransientFetchFailure(error)
  );
}

/** 404 (or build-time API down) → null; caller uses notFound() or empty-state view. */
export async function fetchOrNotFound<TOutput>(
  path: string,
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  init?: RequestInit & { sessionId?: string },
): Promise<TOutput | null> {
  try {
    return await apiFetchParsed(path, schema, init);
  } catch (error) {
    if (isMissingResource(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * CMS page layout: null only when the page was never published (API 404).
 * Server/network/schema errors propagate as 500.
 */
export async function fetchPageLayoutOrNull(slug: string): Promise<unknown> {
  try {
    return await fetchPageLayout(slug);
  } catch (error) {
    if (isMissingResource(error)) {
      return null;
    }
    throw error;
  }
}
