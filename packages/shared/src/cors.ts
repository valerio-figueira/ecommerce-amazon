export function parseCorsOrigins(origins: string): string[] {
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function isDevWebOrigin(origin: string, webPort: number): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    const devPorts = new Set([String(webPort), '3000', '3001']);
    if (!devPorts.has(port)) {
      return false;
    }

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }

    return /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname);
  } catch {
    return false;
  }
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
  options: { nodeEnv: string; webPort: number },
): boolean {
  if (!origin) {
    return true;
  }
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  if (options.nodeEnv === 'development' && isDevWebOrigin(origin, options.webPort)) {
    return true;
  }
  return false;
}

type CorsCallback = (err: Error | null, allow: boolean) => void;

export type CorsOriginDelegate = (origin: string | undefined, callback: CorsCallback) => void;

export function createCorsOriginDelegate(
  allowedOrigins: string[],
  nodeEnv: string,
  webPort: number,
): CorsOriginDelegate | string[] | boolean {
  if (nodeEnv !== 'development') {
    return allowedOrigins.length > 0 ? allowedOrigins : true;
  }

  return (origin: string | undefined, callback: CorsCallback): void => {
    callback(
      null,
      isOriginAllowed(origin, allowedOrigins, { nodeEnv, webPort }),
    );
  };
}
