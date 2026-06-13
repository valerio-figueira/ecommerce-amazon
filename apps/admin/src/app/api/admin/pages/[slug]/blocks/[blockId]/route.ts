import { NextResponse } from 'next/server';

import { adminFetch } from '@/lib/api/admin-fetch';

type RouteParams = { params: Promise<{ slug: string; blockId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug, blockId } = await params;
    const body: unknown = await request.json();
    const block = await adminFetch(
      `/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
      {
        method: 'PATCH',
        body,
      },
    );
    return NextResponse.json(block);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { slug, blockId } = await params;
    const blocks = await adminFetch(
      `/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
      {
        method: 'DELETE',
      },
    );
    return NextResponse.json(blocks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
