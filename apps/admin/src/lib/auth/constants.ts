export const ADMIN_SESSION_COOKIE = 'vitrine_admin_token';

export type AdminSession = {
  id: string;
  email: string;
  name: string;
};

export function getApiUrl(): string {
  const raw =
    process.env['API_INTERNAL_URL'] ??
    process.env['NEXT_PUBLIC_API_URL'] ??
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}
