import { z } from 'zod';

import {
  searchInternalLinkTargetsQuerySchema,
  searchInternalLinkTargetsResponseSchema,
  type InternalLinkTargetDto,
  type SearchInternalLinkTargetsResponse,
} from '@ecommerce-amazon/shared/admin';

import type { InternalLinkTarget } from '@/lib/internal-link-targets';

function toInternalLinkTarget(dto: InternalLinkTargetDto): InternalLinkTarget {
  return {
    type: dto.type,
    label: dto.label,
    slug: dto.slug,
    targetUrl: dto.targetUrl,
    ...(dto.meta !== undefined ? { meta: dto.meta } : {}),
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return `Request failed (${response.status})`;
}

function buildQueryString(params: z.input<typeof searchInternalLinkTargetsQuerySchema>): string {
  const search = new URLSearchParams();
  if (params.search !== undefined && params.search.length > 0) {
    search.set('search', params.search);
  }
  if (params.productLimit !== undefined) {
    search.set('productLimit', String(params.productLimit));
  }
  if (params.selectedUrl !== undefined && params.selectedUrl.length > 0) {
    search.set('selectedUrl', params.selectedUrl);
  }
  return search.toString();
}

export async function searchInternalLinkTargetsClient(
  params: z.input<typeof searchInternalLinkTargetsQuerySchema> = {},
): Promise<SearchInternalLinkTargetsResponse & { targets: InternalLinkTarget[] }> {
  const parsed = searchInternalLinkTargetsQuerySchema.parse(params);
  const query = buildQueryString(parsed);
  const path =
    query.length > 0
      ? `/api/admin/internal-link-targets?${query}`
      : '/api/admin/internal-link-targets';
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  const payload: unknown = await response.json();
  const result = searchInternalLinkTargetsResponseSchema.parse(payload);
  return {
    ...result,
    targets: result.items.map(toInternalLinkTarget),
  };
}

/** Taxonomies + coleções for list label resolution (no product/article bulk load). */
export async function loadInternalLinkTargetsForList(): Promise<InternalLinkTarget[]> {
  const result = await searchInternalLinkTargetsClient({ search: '' });
  return result.targets;
}
