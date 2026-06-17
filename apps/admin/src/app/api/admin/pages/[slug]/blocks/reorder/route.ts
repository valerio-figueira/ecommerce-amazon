import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

import { adminFetch } from '@/lib/api/admin-fetch';

type RouteParams = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body: unknown = await request.json();
    const blocks = await adminFetch(
      `/admin/pages/${encodeURIComponent(slug)}/blocks/reorder`,
      {
        method: 'PATCH',
        body,
      },
    );
    return NextResponse.json(blocks);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
