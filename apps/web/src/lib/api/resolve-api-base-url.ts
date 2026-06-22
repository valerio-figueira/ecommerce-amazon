const DEFAULT_API_URL = 'http://localhost:3000';

/**
 * Browser calls the public API host; SSR in Docker uses the overlay (api:3000).
 * Mirrors robots.ts and admin BFF fetchers.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
  }

  return process.env['API_INTERNAL_URL'] ?? process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
}
