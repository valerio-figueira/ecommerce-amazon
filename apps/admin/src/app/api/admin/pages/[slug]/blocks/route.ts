import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

import { adminFetch } from '@/lib/api/admin-fetch';

type RouteParams = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body: unknown = await request.json();
    const block = await adminFetch(`/admin/pages/${encodeURIComponent(slug)}/blocks`, {
      method: 'POST',
      body,
    });
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
