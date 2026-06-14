import { NextResponse } from 'next/server';

import { deleteAutoLink, updateAutoLink } from '@/lib/api/auto-links';
import {
  autoLinkIdParamsSchema,
  updateAutoLinkBodySchema,
} from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function resolveErrorStatus(message: string): number {
  if (message === 'Unauthorized') return 401;
  if (message === 'Keyword já cadastrada') return 409;
  return 400;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = autoLinkIdParamsSchema.parse(await context.params);
    const body: unknown = await request.json();
    const parsed = updateAutoLinkBodySchema.parse(body);
    await updateAutoLink(id, parsed);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = resolveErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = autoLinkIdParamsSchema.parse(await context.params);
    await deleteAutoLink(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
