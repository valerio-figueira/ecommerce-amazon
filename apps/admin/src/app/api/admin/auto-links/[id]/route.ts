import { NextResponse } from 'next/server';
import {
  getBffErrorMessage,
  isUnauthorizedError,
  isServiceUnavailableError,
  resolveBffStatus,
} from '@/lib/api/bff-error-status';

import { deleteAutoLink, updateAutoLink } from '@/lib/api/auto-links';
import { autoLinkIdParamsSchema, updateAutoLinkBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function resolveErrorStatus(error: unknown, message: string): number {
  if (isUnauthorizedError(error)) return 401;
  if (isServiceUnavailableError(error)) return 503;
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
    const status = resolveErrorStatus(error, message);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = autoLinkIdParamsSchema.parse(await context.params);
    await deleteAutoLink(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
