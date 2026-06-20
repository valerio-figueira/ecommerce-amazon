import { NextResponse } from 'next/server';
import {
  getBffErrorMessage,
  getBffErrorStatus,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';

import {
  deleteContentCluster,
  getContentCluster,
  updateContentCluster,
} from '@/lib/api/content-clusters';
import { updateContentClusterBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getContentCluster(id);
    return NextResponse.json(result);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateContentClusterBodySchema.parse(body);
    await updateContentCluster(id, parsed);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteContentCluster(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
