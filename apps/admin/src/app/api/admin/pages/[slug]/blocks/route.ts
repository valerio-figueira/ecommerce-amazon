import { NextResponse } from 'next/server';

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
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
