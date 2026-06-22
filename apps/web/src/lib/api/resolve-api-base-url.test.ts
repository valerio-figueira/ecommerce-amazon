import { afterEach, describe, expect, it } from 'vitest';

import { resolveApiBaseUrl } from './resolve-api-base-url';

describe('resolveApiBaseUrl', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    delete process.env['API_INTERNAL_URL'];
    delete process.env['NEXT_PUBLIC_API_URL'];
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
    process.env['API_INTERNAL_URL'] = 'http://api:3000';
    process.env['NEXT_PUBLIC_API_URL'] = 'https://api.example.com';

    expect(resolveApiBaseUrl()).toBe('http://api:3000');
  });

  it('uses NEXT_PUBLIC_API_URL in the browser', () => {
    globalThis.window = {} as Window & typeof globalThis;
    process.env['API_INTERNAL_URL'] = 'http://api:3000';
    process.env['NEXT_PUBLIC_API_URL'] = 'https://api.example.com';

    expect(resolveApiBaseUrl()).toBe('https://api.example.com');
  });
});
