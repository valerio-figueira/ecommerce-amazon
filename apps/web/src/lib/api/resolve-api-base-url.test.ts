import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BROWSER_API_PROXY_PREFIX,
  SWARM_API_OVERLAY_URL,
  resolveApiBaseUrl,
  resolveProductionServerApiBaseUrl,
} from './resolve-api-base-url';

describe('resolveProductionServerApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers API_INTERNAL_URL when set', () => {
    vi.stubEnv('API_INTERNAL_URL', 'http://api:3000');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');

    expect(resolveProductionServerApiBaseUrl('https://api.example.com')).toBe('http://api:3000');
  });

  it('uses Swarm overlay in production when public URL is external', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(resolveProductionServerApiBaseUrl('https://api.desksetup.com.br')).toBe(
      SWARM_API_OVERLAY_URL,
    );
  });

  it('keeps localhost API URL in production for local npm start', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(resolveProductionServerApiBaseUrl('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
  });

  it('uses localhost default in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(resolveProductionServerApiBaseUrl(undefined)).toBe('http://localhost:3000');
  });
});

describe('resolveApiBaseUrl', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalWindow === undefined) {
      // @ts-expect-error restore jsdom-less env
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it('prefers API_INTERNAL_URL on the server', () => {
    // @ts-expect-error simulate Node SSR
    delete globalThis.window;
    vi.stubEnv('API_INTERNAL_URL', 'http://api:3000');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');

    expect(resolveApiBaseUrl()).toBe('http://api:3000');
  });

  it('falls back to Swarm overlay on production server without API_INTERNAL_URL', () => {
    // @ts-expect-error simulate Node SSR
    delete globalThis.window;
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.desksetup.com.br');

    expect(resolveApiBaseUrl()).toBe(SWARM_API_OVERLAY_URL);
  });

  it('uses same-origin BFF proxy in the browser', () => {
    globalThis.window = {} as Window & typeof globalThis;
    vi.stubEnv('API_INTERNAL_URL', 'http://api:3000');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');

    expect(resolveApiBaseUrl()).toBe(BROWSER_API_PROXY_PREFIX);
  });
});
