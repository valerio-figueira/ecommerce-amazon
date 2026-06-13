export const SESSION_COOKIE = 'vitrine_session';

export function getOrCreateSessionId(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }
  const id = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
  return id;
}
