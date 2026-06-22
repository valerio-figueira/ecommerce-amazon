import { describe, expect, it } from 'vitest';

import { resolveUploadImageSrc } from './resolve-upload-image-src.js';

describe('resolveUploadImageSrc', () => {
  const env = {
    storagePublicBaseUrl: 'https://api.desksetup.com.br/uploads',
    apiPublicUrl: 'https://api.desksetup.com.br',
  };

  it('rewrites API upload URLs to same-origin path', () => {
    expect(
      resolveUploadImageSrc(
        'https://api.desksetup.com.br/uploads/admin-avatars/2026/06/avatar.jpg',
        env,
      ),
    ).toBe('/uploads/admin-avatars/2026/06/avatar.jpg');
  });

  it('keeps same-origin paths unchanged', () => {
    expect(resolveUploadImageSrc('/uploads/admin-avatars/x.jpg', env)).toBe(
      '/uploads/admin-avatars/x.jpg',
    );
  });

  it('does not rewrite external CDN URLs', () => {
    const external = 'https://images.pexels.com/photos/123.jpeg';
    expect(resolveUploadImageSrc(external, env)).toBe(external);
  });

  it('rewrites localhost dev uploads', () => {
    expect(
      resolveUploadImageSrc('http://localhost:3000/uploads/admin-avatars/2026/06/avatar.jpg', {
        storagePublicBaseUrl: 'http://localhost:3000/uploads',
        apiPublicUrl: 'http://localhost:3000',
      }),
    ).toBe('/uploads/admin-avatars/2026/06/avatar.jpg');
  });

  it('rewrites path-mode API uploads (/api/uploads)', () => {
    expect(
      resolveUploadImageSrc('http://203.0.113.10/api/uploads/admin-avatars/x.jpg', {
        storagePublicBaseUrl: 'http://203.0.113.10/api/uploads',
        apiPublicUrl: 'http://203.0.113.10/api',
      }),
    ).toBe('/uploads/admin-avatars/x.jpg');
  });
});
