import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus, resolveBffStatus } from '@/lib/api/bff-error-status';

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
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
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
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
