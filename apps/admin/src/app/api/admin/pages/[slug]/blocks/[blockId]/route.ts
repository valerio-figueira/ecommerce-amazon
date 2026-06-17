import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

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
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
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
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
