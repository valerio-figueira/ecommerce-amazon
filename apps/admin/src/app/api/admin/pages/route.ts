import { NextResponse } from 'next/server';

import { adminFetch } from '@/lib/api/admin-fetch';

export async function GET() {
  try {
    const pages = await adminFetch('/admin/pages');
    return NextResponse.json(pages);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
