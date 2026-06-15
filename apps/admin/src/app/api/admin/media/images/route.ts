import { NextResponse } from 'next/server';

import { adminFetchMultipart } from '@/lib/api/admin-fetch-multipart';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await adminFetchMultipart('/admin/media/images', formData);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
