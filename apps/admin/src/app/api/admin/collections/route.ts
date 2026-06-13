import { NextResponse } from 'next/server';

import { createAdminCollection, listAdminCollections } from '@/lib/api/collections';
import { createCollectionBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const items = await listAdminCollections();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createCollectionBodySchema.parse(body);
    const result = await createAdminCollection(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
