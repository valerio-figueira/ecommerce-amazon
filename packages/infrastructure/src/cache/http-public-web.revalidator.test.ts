import { describe, expect, it, vi } from 'vitest';

import { HttpPublicWebRevalidator } from './http-public-web.revalidator.js';

function createLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

describe('HttpPublicWebRevalidator', () => {
  it('retries on fetch network errors and succeeds', async () => {
    const logger = createLogger();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed', { cause: new Error('ECONNREFUSED') }))
      .mockResolvedValueOnce({ ok: true });

    vi.stubGlobal('fetch', fetchMock);

    const revalidator = new HttpPublicWebRevalidator('http://web:3001', 'secret', logger, 3);

    await revalidator.revalidate({ paths: ['/sobre'], tags: ['public:team-members'] });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledWith(
      'Public web revalidation request failed, retrying',
      expect.objectContaining({ attempt: 1 }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Public web revalidation succeeded',
      expect.objectContaining({ attempt: 2 }),
    );

    vi.unstubAllGlobals();
  });

  it('does not retry on HTTP error responses', async () => {
    const logger = createLogger();
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    vi.stubGlobal('fetch', fetchMock);

    const revalidator = new HttpPublicWebRevalidator('http://web:3001', 'secret', logger, 3);

    await revalidator.revalidate({ paths: ['/sobre'] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      'Public web revalidation failed',
      expect.objectContaining({ status: 401 }),
    );

    vi.unstubAllGlobals();
  });
});
