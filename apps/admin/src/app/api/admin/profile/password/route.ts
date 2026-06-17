import { NextResponse } from 'next/server';

import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';
import { changeOperatorPassword } from '@/lib/api/operators';
import { changeOperatorPasswordBodySchema } from '@ecommerce-amazon/shared/admin';

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = changeOperatorPasswordBodySchema.parse(body);
    const result = await changeOperatorPassword(parsed);
    return NextResponse.json(result);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
