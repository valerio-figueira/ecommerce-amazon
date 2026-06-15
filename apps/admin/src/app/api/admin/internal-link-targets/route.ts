import { NextResponse } from 'next/server';

import { adminFetchParsed } from '@/lib/api/admin-fetch';
import {
  searchInternalLinkTargetsQuerySchema,
  searchInternalLinkTargetsResponseSchema,
} from '@ecommerce-amazon/shared/admin';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const query = searchInternalLinkTargetsQuerySchema.parse({
      search: url.searchParams.get('search') ?? undefined,
      productLimit: url.searchParams.get('productLimit') ?? undefined,
      selectedUrl: url.searchParams.get('selectedUrl') ?? undefined,
    });

    const search = new URLSearchParams();
    if (query.search !== undefined && query.search.length > 0) {
      search.set('search', query.search);
    }
    if (query.productLimit !== undefined) {
      search.set('productLimit', String(query.productLimit));
    }
    if (query.selectedUrl !== undefined && query.selectedUrl.length > 0) {
      search.set('selectedUrl', query.selectedUrl);
    }

    const path =
      search.toString().length > 0
        ? `/admin/internal-link-targets?${search.toString()}`
        : '/admin/internal-link-targets';

    const result = await adminFetchParsed(path, searchInternalLinkTargetsResponseSchema);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
