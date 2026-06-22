export type NextImageRemotePattern = {
  protocol: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
};

export type NextImageRemoteEnv = {
  NEXT_PUBLIC_API_URL?: string | undefined;
  STORAGE_PUBLIC_BASE_URL?: string | undefined;
  API_INTERNAL_URL?: string | undefined;
  NEXT_ALLOWED_DEV_ORIGINS?: string | undefined;
};

const BUILTIN_REMOTE_PATTERNS: NextImageRemotePattern[] = [
  { protocol: 'https', hostname: 'placehold.co' },
  { protocol: 'https', hostname: 'images.pexels.com' },
];

function parseRemoteProtocol(protocolWithColon: string): 'http' | 'https' | null {
  const protocol = protocolWithColon.replace(':', '');
  if (protocol === 'http' || protocol === 'https') {
    return protocol;
  }
  return null;
}

function patternFromUrl(urlString: string): NextImageRemotePattern | null {
  try {
    const url = new URL(urlString);
    const protocol = parseRemoteProtocol(url.protocol);
    if (!protocol) {
      return null;
    }
    const pattern: NextImageRemotePattern = {
      protocol,
      hostname: url.hostname,
    };
    if (url.port) {
      pattern.port = url.port;
    }
    return pattern;
  } catch {
    return null;
  }
}

function dedupePatterns(patterns: NextImageRemotePattern[]): NextImageRemotePattern[] {
  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = `${pattern.protocol}|${pattern.hostname}|${pattern.port ?? ''}|${pattern.pathname ?? ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function collectImageRemoteBaseUrls(env: NextImageRemoteEnv): string[] {
  const urls: string[] = [];

  const apiUrl = env.NEXT_PUBLIC_API_URL ?? env.API_INTERNAL_URL;
  if (apiUrl) {
    urls.push(apiUrl);
  }

  if (env.STORAGE_PUBLIC_BASE_URL) {
    urls.push(env.STORAGE_PUBLIC_BASE_URL);
  } else if (apiUrl) {
    urls.push(`${apiUrl.replace(/\/+$/, '')}/uploads`);
  }

  const devOrigins =
    env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0) ?? [];

  for (const origin of devOrigins) {
    if (origin.startsWith('http://') || origin.startsWith('https://')) {
      urls.push(origin);
    } else {
      urls.push(`http://${origin}`);
      urls.push(`https://${origin}`);
    }
  }

  return urls;
}

export function buildNextImageRemotePatterns(
  env: NextImageRemoteEnv = {},
): NextImageRemotePattern[] {
  const fromUrls = collectImageRemoteBaseUrls(env)
    .map(patternFromUrl)
    .filter((pattern): pattern is NextImageRemotePattern => pattern !== null);

  const localhostDefaults: NextImageRemotePattern[] = [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'http', hostname: '127.0.0.1' },
  ];

  return dedupePatterns([...BUILTIN_REMOTE_PATTERNS, ...fromUrls, ...localhostDefaults]);
}

function remotePatternMatchesUrl(pattern: NextImageRemotePattern, url: URL): boolean {
  const protocol = url.protocol.replace(':', '');
  if (pattern.protocol !== protocol) {
    return false;
  }
  if (pattern.hostname !== url.hostname) {
    return false;
  }
  if (pattern.port !== undefined && pattern.port !== '' && pattern.port !== url.port) {
    return false;
  }
  if (
    pattern.pathname !== undefined &&
    pattern.pathname !== '' &&
    !url.pathname.startsWith(pattern.pathname)
  ) {
    return false;
  }
  return true;
}

export function isNextImageRemoteUrl(
  src: string,
  patterns: NextImageRemotePattern[] = buildNextImageRemotePatterns(),
): boolean {
  if (src.startsWith('/uploads/')) {
    return true;
  }

  try {
    const url = new URL(src);
    return patterns.some((pattern) => remotePatternMatchesUrl(pattern, url));
  } catch {
    return false;
  }
}
