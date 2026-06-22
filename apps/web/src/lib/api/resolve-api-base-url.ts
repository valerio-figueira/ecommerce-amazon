const DEFAULT_API_URL = 'http://localhost:3000';

/** Same-origin prefix — Next.js rewrites to the API (see apps/web/next.config.ts). */
export const BROWSER_API_PROXY_PREFIX = '/public-api';

/** Swarm overlay hostname — must match `API_INTERNAL_URL` in deploy/docker-stack.yml. */
export const SWARM_API_OVERLAY_URL = 'http://api:3000';

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function nonEmptyEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * In production SSR, never call the public API host from inside the web container (hairpin/NAT
 * timeout on VPS). Fall back to the Swarm overlay even when API_INTERNAL_URL is missing from env.
 */
export function resolveProductionServerApiBaseUrl(publicUrl: string | undefined): string {
  const internal = nonEmptyEnv('API_INTERNAL_URL');
  if (internal) {
    return trimTrailingSlashes(internal);
  }

  if (process.env['NODE_ENV'] !== 'production') {
    return publicUrl ?? DEFAULT_API_URL;
  }

  if (!publicUrl) {
    return SWARM_API_OVERLAY_URL;
  }

  try {
    const host = new URL(publicUrl).hostname;
    if (isLoopbackHostname(host)) {
      return trimTrailingSlashes(publicUrl);
    }
  } catch {
    return SWARM_API_OVERLAY_URL;
  }

  return SWARM_API_OVERLAY_URL;
}

/**
 * Browser calls the vitrine origin (`/public-api/*` rewrite); SSR in Docker uses the overlay.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return BROWSER_API_PROXY_PREFIX;
  }

  return resolveProductionServerApiBaseUrl(nonEmptyEnv('NEXT_PUBLIC_API_URL'));
}
