import { NextResponse } from 'next/server';

import {
  createContentCluster,
  listContentClusters,
} from '@/lib/api/content-clusters';
import { createContentClusterBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const result = await listContentClusters();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createContentClusterBodySchema.parse(body);
    const result = await createContentCluster(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
