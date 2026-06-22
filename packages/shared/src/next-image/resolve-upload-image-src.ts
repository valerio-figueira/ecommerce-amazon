export type ResolveUploadImageSrcEnv = {
  storagePublicBaseUrl: string;
  apiPublicUrl?: string | undefined;
};

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function apiPathPrefix(apiPublicUrl: string): string {
  const api = new URL(trimTrailingSlashes(apiPublicUrl));
  const basePath = api.pathname.replace(/\/+$/, '');
  return basePath.length > 0 ? basePath : '';
}

function isManagedUploadPathname(pathname: string, apiPublicUrl?: string): boolean {
  if (pathname.startsWith('/uploads/')) {
    return true;
  }

  if (!apiPublicUrl) {
    return false;
  }

  const prefix = `${apiPathPrefix(apiPublicUrl)}/uploads/`;
  return prefix !== '/uploads/' && pathname.startsWith(prefix);
}

function toSameOriginUploadPath(pathname: string, apiPublicUrl?: string): string {
  if (pathname.startsWith('/uploads/')) {
    return pathname;
  }

  if (!apiPublicUrl) {
    return pathname;
  }

  const prefix = `${apiPathPrefix(apiPublicUrl)}/uploads/`;
  if (prefix !== '/uploads/' && pathname.startsWith(prefix)) {
    return `/uploads/${pathname.slice(prefix.length)}`;
  }

  return pathname;
}

function matchesManagedUploadOrigin(url: URL, env: ResolveUploadImageSrcEnv): boolean {
  if (!isManagedUploadPathname(url.pathname, env.apiPublicUrl)) {
    return false;
  }

  try {
    const storageUrl = new URL(trimTrailingSlashes(env.storagePublicBaseUrl));
    if (url.origin === storageUrl.origin) {
      return true;
    }
  } catch {
    // ignore invalid storage base
  }

  if (env.apiPublicUrl) {
    try {
      const apiUrl = new URL(trimTrailingSlashes(env.apiPublicUrl));
      if (url.origin === apiUrl.origin) {
        return true;
      }
    } catch {
      // ignore invalid api url
    }
  }

  return false;
}

/**
 * Rewrites managed filesystem upload URLs (API /uploads) to same-origin paths so
 * next/image fetches via /uploads proxy (overlay) instead of the public API host.
 */
export function resolveUploadImageSrc(src: string, env: ResolveUploadImageSrcEnv): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  if (!matchesManagedUploadOrigin(parsed, env)) {
    return trimmed;
  }

  const pathname = toSameOriginUploadPath(parsed.pathname, env.apiPublicUrl);
  return `${pathname}${parsed.search}`;
}
