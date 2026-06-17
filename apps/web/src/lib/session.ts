import {
  CONSENT_COOKIE_NAME,
  CONSENT_VALUE,
  SESSION_COOKIE_NAME,
} from '@ecommerce-amazon/shared/legal';

const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function generateSessionId(): string {
  const webCrypto = globalThis.crypto;

  if (typeof webCrypto?.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }

  if (typeof webCrypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    webCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error('Crypto API unavailable — use HTTPS or localhost for session support');
}

export function hasFunctionalConsent(): boolean {
  return readCookie(CONSENT_COOKIE_NAME) === CONSENT_VALUE;
}

export function acceptFunctionalConsent(): void {
  writeCookie(CONSENT_COOKIE_NAME, CONSENT_VALUE, CONSENT_MAX_AGE_SECONDS);
}

export function getOrCreateSessionId(): string {
  if (typeof document === 'undefined') {
    return '';
  }

  if (!hasFunctionalConsent()) {
    return '';
  }

  const existing = readCookie(SESSION_COOKIE_NAME);
  if (existing) {
    return existing;
  }

  const id = generateSessionId();
  writeCookie(SESSION_COOKIE_NAME, id, CONSENT_MAX_AGE_SECONDS);
  return id;
}

export function clearSessionCookie(): void {
  deleteCookie(SESSION_COOKIE_NAME);
}
