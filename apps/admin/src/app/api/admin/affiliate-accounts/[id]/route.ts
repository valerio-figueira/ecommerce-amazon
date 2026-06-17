import { NextResponse } from 'next/server';

import { getBffErrorMessage, resolveBffStatus } from '@/lib/api/bff-error-status';
import { updateAffiliateAccount } from '@/lib/api/affiliate-accounts';
import { updateAffiliateAccountBodySchema } from '@ecommerce-amazon/shared/admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateAffiliateAccountBodySchema.parse(body);
    const result = await updateAffiliateAccount(id, parsed);
    return NextResponse.json(result);
  } catch (error) {
    const status = resolveBffStatus(error, 400);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
