import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';

import { adminFetch } from '@/lib/api/admin-fetch';

export async function GET() {
  try {
    const pages = await adminFetch('/admin/pages');
    return NextResponse.json(pages);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
