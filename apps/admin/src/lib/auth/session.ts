import { jwtVerify } from 'jose';

import { ADMIN_SESSION_COOKIE, getJwtSecret, type AdminSession } from './constants';

export { ADMIN_SESSION_COOKIE, type AdminSession };

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    const sub = payload.sub;
    const email = payload['email'];
    const name = payload['name'];

    if (typeof sub !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
      return null;
    }

    return { id: sub, email, name };
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(
  cookieValue: string | undefined,
): Promise<AdminSession | null> {
  if (!cookieValue) return null;
  return verifySessionToken(cookieValue);
}
