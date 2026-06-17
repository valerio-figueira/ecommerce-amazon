import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';

import { adminFetchMultipart } from '@/lib/api/admin-fetch-multipart';
import { adminFetch } from '@/lib/api/admin-fetch';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await adminFetchMultipart('/admin/profile/avatar', formData);
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    await adminFetch('/admin/profile/avatar', { method: 'DELETE' });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
