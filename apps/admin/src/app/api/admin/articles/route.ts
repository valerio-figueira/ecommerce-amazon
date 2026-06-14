import { NextResponse } from 'next/server';

import { listAdminArticles } from '@/lib/api/articles';

export async function GET() {
  try {
    const items = await listAdminArticles();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
