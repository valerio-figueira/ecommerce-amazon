import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';

import { adminFetchMultipart } from '@/lib/api/admin-fetch-multipart';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await adminFetchMultipart('/admin/media/images', formData);
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
