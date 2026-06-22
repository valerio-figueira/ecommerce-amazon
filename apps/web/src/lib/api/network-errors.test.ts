import { describe, expect, it } from 'vitest';

import { isTransientFetchFailure } from './network-errors';

describe('isTransientFetchFailure', () => {
  it('detects fetch failed TypeError', () => {
    expect(isTransientFetchFailure(new TypeError('fetch failed'))).toBe(true);
  });

  it('detects connect timeout on cause', () => {
    const error = new TypeError('fetch failed');
    error.cause = Object.assign(new Error('Connect Timeout Error'), {
      code: 'UND_ERR_CONNECT_TIMEOUT',
    });
    expect(isTransientFetchFailure(error)).toBe(true);
  });

  it('returns false for API 500 errors', () => {
    expect(isTransientFetchFailure(new Error('API error 500'))).toBe(false);
  });
});
