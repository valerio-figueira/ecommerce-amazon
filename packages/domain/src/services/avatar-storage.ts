export const ADMIN_AVATAR_KEY_REGEX =
  /^admin-avatars\/\d{4}\/\d{2}\/avatar-\d{8}-\d{6}-[a-f0-9]{32}\.[a-z0-9]+$/;

export function isManagedAvatarKey(key: string): boolean {
  return ADMIN_AVATAR_KEY_REGEX.test(key);
}

export function extractManagedKeyFromUrl(url: string, publicBaseUrl: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let path: string;
  try {
    const base = new URL(publicBaseUrl);
    const candidate = new URL(trimmed);
    if (candidate.origin !== base.origin) {
      return null;
    }
    path = candidate.pathname.replace(/^\/+/, '');
  } catch {
    return null;
  }

  const basePath = new URL(publicBaseUrl).pathname.replace(/^\/+|\/+$/g, '');
  if (basePath && path.startsWith(`${basePath}/`)) {
    path = path.slice(basePath.length + 1);
  } else if (basePath && path === basePath) {
    return null;
  }

  return isManagedAvatarKey(path) ? path : null;
}
