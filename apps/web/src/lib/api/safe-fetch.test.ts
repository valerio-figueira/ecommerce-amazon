import { z } from 'zod';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from './client';

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    ...actual,
    apiFetchParsed: vi.fn(),
    fetchPageLayout: vi.fn(),
  };
});

import { apiFetchParsed, fetchPageLayout } from './client';
import { fetchOrNotFound, fetchPageLayoutOrNull } from './safe-fetch';

const schema = z.object({ id: z.string() });

describe('fetchOrNotFound', () => {
  beforeEach(() => {
    vi.mocked(apiFetchParsed).mockReset();
    delete process.env['NEXT_PHASE'];
  });

  it('returns null on 404', async () => {
    vi.mocked(apiFetchParsed).mockRejectedValue(new ApiError(404, '/products/x'));

    await expect(fetchOrNotFound('/products/x', schema)).resolves.toBeNull();
  });

  it('rethrows 500', async () => {
    vi.mocked(apiFetchParsed).mockRejectedValue(new ApiError(500, '/products/x'));

    await expect(fetchOrNotFound('/products/x', schema)).rejects.toThrow(ApiError);
  });

  it('returns null on network failure at runtime', async () => {
    vi.mocked(apiFetchParsed).mockRejectedValue(new TypeError('fetch failed'));

    await expect(fetchOrNotFound('/products/x', schema)).resolves.toBeNull();
  });

  it('returns null on connect timeout at runtime', async () => {
    const error = new TypeError('fetch failed');
    error.cause = Object.assign(new Error('Connect Timeout Error'), {
      code: 'UND_ERR_CONNECT_TIMEOUT',
    });
    vi.mocked(apiFetchParsed).mockRejectedValue(error);

    await expect(fetchOrNotFound('/products/x', schema)).resolves.toBeNull();
  });

  it('returns null on network failure during production build', async () => {
    process.env['NEXT_PHASE'] = 'phase-production-build';
    vi.mocked(apiFetchParsed).mockRejectedValue(new TypeError('fetch failed'));

    await expect(fetchOrNotFound('/products/x', schema)).resolves.toBeNull();
  });
});

describe('fetchPageLayoutOrNull', () => {
  beforeEach(() => {
    vi.mocked(fetchPageLayout).mockReset();
    delete process.env['NEXT_PHASE'];
  });

  it('returns null when CMS page is missing (404)', async () => {
    vi.mocked(fetchPageLayout).mockRejectedValue(new ApiError(404, '/pages/home'));

    await expect(fetchPageLayoutOrNull('home')).resolves.toBeNull();
  });

  it('returns null on network failure at runtime', async () => {
    vi.mocked(fetchPageLayout).mockRejectedValue(new TypeError('fetch failed'));

    await expect(fetchPageLayoutOrNull('home')).resolves.toBeNull();
  });

  it('rethrows API 500', async () => {
    vi.mocked(fetchPageLayout).mockRejectedValue(new ApiError(500, '/pages/home'));

    await expect(fetchPageLayoutOrNull('home')).rejects.toThrow(ApiError);
  });
});
