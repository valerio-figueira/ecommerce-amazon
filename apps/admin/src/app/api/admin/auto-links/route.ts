import { NextResponse } from 'next/server';

import { createAutoLink, listAutoLinks } from '@/lib/api/auto-links';
import {
  createAutoLinkBodySchema,
  listAutoLinksQuerySchema,
} from '@ecommerce-amazon/shared/admin';

function resolveErrorStatus(message: string): number {
  if (message === 'Unauthorized') return 401;
  if (message === 'Keyword já cadastrada') return 409;
  return 400;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = listAutoLinksQuerySchema.parse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
    });
    const result = await listAutoLinks(query);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createAutoLinkBodySchema.parse(body);
    const result = await createAutoLink(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = resolveErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
