import { NextResponse } from 'next/server';
import { getBffErrorMessage, getBffErrorStatus } from '@/lib/api/bff-error-status';

import { getOperatorProfile, updateOperatorProfile } from '@/lib/api/profile';
import { getSessionCookieMaxAge } from '@/lib/auth/jwt-expiry';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';
import { SESSION_COOKIE_OPTIONS } from '@/lib/auth/session-guard';
import { updateOperatorProfileBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const profile = await getOperatorProfile();
    return NextResponse.json(profile);
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = updateOperatorProfileBodySchema.parse(await request.json());
    const result = await updateOperatorProfile(body);

    const nextResponse = NextResponse.json(result);
    nextResponse.cookies.set(ADMIN_SESSION_COOKIE, result.token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: getSessionCookieMaxAge(),
    });

    return nextResponse;
  } catch (error) {
    const status = getBffErrorStatus(error);
    const message = getBffErrorMessage(error);
    return NextResponse.json({ error: message }, { status });
  }
}
