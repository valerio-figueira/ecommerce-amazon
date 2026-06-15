import { NextResponse } from 'next/server';

import { adminFetchMultipart } from '@/lib/api/admin-fetch-multipart';
import { adminFetch } from '@/lib/api/admin-fetch';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await adminFetchMultipart('/admin/profile/avatar', formData);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    await adminFetch('/admin/profile/avatar', { method: 'DELETE' });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
