import { NextResponse } from 'next/server';
import { getBffErrorMessage, isUnauthorizedError, resolveBffStatus } from '@/lib/api/bff-error-status';

import { ZodError } from 'zod';

import {
  deleteAdminComparison,
  getAdminComparison,
  updateAdminComparison,
} from '@/lib/api/comparisons';
import { updateAdminComparisonBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function resolveErrorStatus(error: unknown): number {
  if (error instanceof ZodError) {
    return 400;
  }
  if (isUnauthorizedError(error)) {
    return 401;
  }
  const message = getBffErrorMessage(error);
  if (message.toLowerCase().includes('not found') || message.includes('(404)')) {
    return 404;
  }
  return 500;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getAdminComparison(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json({ error: message }, { status: resolveErrorStatus(error) });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateAdminComparisonBodySchema.parse(body);
    await updateAdminComparison(id, parsed);
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
    await deleteAdminComparison(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
