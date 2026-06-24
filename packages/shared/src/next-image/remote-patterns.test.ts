import { describe, expect, it } from 'vitest';

import {
  buildNextImageRemotePatterns,
  collectImageRemoteBaseUrls,
  isNextImageRemoteUrl,
} from './remote-patterns.js';

describe('next-image remote patterns', () => {
  it('collects API and storage base URLs from env', () => {
    const urls = collectImageRemoteBaseUrls({
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      STORAGE_PUBLIC_BASE_URL: 'http://localhost:3000/uploads',
    });

    expect(urls).toContain('http://localhost:3000');
    expect(urls).toContain('http://localhost:3000/uploads');
  });

  it('derives uploads URL when storage base is omitted', () => {
    const urls = collectImageRemoteBaseUrls({
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
    });

    expect(urls).toContain('http://localhost:3000/uploads');
  });

  it('allows localhost avatar URLs used by managed storage', () => {
    const patterns = buildNextImageRemotePatterns({
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      STORAGE_PUBLIC_BASE_URL: 'http://localhost:3000/uploads',
    });

    expect(
      isNextImageRemoteUrl(
        'http://localhost:3000/uploads/admin-avatars/2026/06/avatar.jpg',
        patterns,
      ),
    ).toBe(true);
  });

  it('rejects unknown external hosts', () => {
    const patterns = buildNextImageRemotePatterns({
      NEXT_PUBLIC_API_URL: 'http://localhost:3000',
    });

    expect(isNextImageRemoteUrl('https://unknown-cdn.example/photo.jpg', patterns)).toBe(false);
  });

  it('uses plain img for same-origin proxied upload paths (no _next/image hard failure)', () => {
    expect(isNextImageRemoteUrl('/uploads/admin-avatars/x.jpg', [])).toBe(false);
  });
});
