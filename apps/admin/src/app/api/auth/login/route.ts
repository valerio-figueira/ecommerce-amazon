import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ADMIN_SESSION_COOKIE, getApiUrl } from '@/lib/auth/constants';

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const LoginResponseSchema = z.object({
  token: z.string().min(1),
});

const LoginErrorSchema = z.object({
  error: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = LoginBodySchema.parse(await request.json());
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const rawPayload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const errorPayload = LoginErrorSchema.safeParse(rawPayload);
      return NextResponse.json(
        { error: errorPayload.success ? errorPayload.data.error : 'E-mail ou senha inválidos' },
        { status: response.status === 401 ? 401 : 400 },
      );
    }

    const payload = LoginResponseSchema.safeParse(rawPayload);
    if (!payload.success) {
      return NextResponse.json({ error: 'Resposta inválida do servidor' }, { status: 502 });
    }

    const nextResponse = NextResponse.json({ ok: true });
    nextResponse.cookies.set(ADMIN_SESSION_COOKIE, payload.data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return nextResponse;
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
  }
}
