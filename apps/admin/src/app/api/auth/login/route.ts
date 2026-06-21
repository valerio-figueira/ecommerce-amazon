import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSessionCookieMaxAge } from '@/lib/auth/jwt-expiry';
import { ADMIN_SESSION_COOKIE, getApiUrl } from '@/lib/auth/constants';
import {
  GENERIC_LOGIN_ERROR,
  LOGIN_RATE_LIMIT_ERROR,
  LOGIN_UNAVAILABLE_ERROR,
} from '@/lib/auth/login-errors';
import { SESSION_COOKIE_OPTIONS } from '@/lib/auth/session-guard';

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const LoginResponseSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: Request) {
  let body: z.infer<typeof LoginBodySchema>;
  try {
    body = LoginBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }

  const apiUrl = getApiUrl();

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: LOGIN_UNAVAILABLE_ERROR }, { status: 503 });
  }

  const rawPayload: unknown = await response.json().catch(() => null);

  if (response.status === 429) {
    return NextResponse.json({ error: LOGIN_RATE_LIMIT_ERROR }, { status: 429 });
  }

  if (response.status === 503) {
    return NextResponse.json({ error: LOGIN_UNAVAILABLE_ERROR }, { status: 503 });
  }

  if (!response.ok) {
    console.error('Admin login upstream failed', {
      status: response.status,
      apiUrl: getApiUrl(),
    });
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  const payload = LoginResponseSchema.safeParse(rawPayload);
  if (!payload.success) {
    return NextResponse.json({ error: 'Resposta inválida do servidor' }, { status: 502 });
  }

  const nextResponse = NextResponse.json({ ok: true });
  nextResponse.cookies.set(ADMIN_SESSION_COOKIE, payload.data.token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: getSessionCookieMaxAge(),
  });

  return nextResponse;
}
