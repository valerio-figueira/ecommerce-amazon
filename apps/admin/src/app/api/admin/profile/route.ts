import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';
import { getOperatorProfile, updateOperatorProfile } from '@/lib/api/profile';
import { updateOperatorProfileBodySchema } from '@ecommerce-amazon/shared/admin';

export async function GET() {
  try {
    const profile = await getOperatorProfile();
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = updateOperatorProfileBodySchema.parse(await request.json());
    const result = await updateOperatorProfile(body);

    const nextResponse = NextResponse.json(result);
    nextResponse.cookies.set(ADMIN_SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return nextResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
