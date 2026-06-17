import { NextResponse } from 'next/server';
import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';

import { adminFetch } from '@/lib/api/admin-fetch';

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const layout = await adminFetch(`/admin/pages/${encodeURIComponent(slug)}`);
    return NextResponse.json(layout);
  } catch (error) {
    const message = getBffErrorMessage(error);
    const status = resolveBffStatus(error, message.includes('not found') ? 404 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}
