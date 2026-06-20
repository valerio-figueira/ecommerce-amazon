import { describe, expect, it } from 'vitest';

import { loadEnv } from './index.js';

describe('loadEnv', () => {
  it('treats empty optional URL env as unset', () => {
    const env = loadEnv({
      WEB_PUBLIC_URL: '',
      NEXT_PUBLIC_SITE_URL: '',
      STORAGE_PUBLIC_BASE_URL: '',
    });

    expect(env.WEB_PUBLIC_URL).toBe('http://localhost:3001');
    expect(env.STORAGE_PUBLIC_BASE_URL).toBeUndefined();
  });
});
