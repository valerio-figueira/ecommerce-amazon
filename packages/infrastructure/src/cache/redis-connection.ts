export type RedisConnectionOptions = {
  host: string;
  port: number;
  db: number;
  maxRetriesPerRequest: null;
  retryStrategy?: (times: number) => number | void | null;
  reconnectOnError?: (error: Error) => boolean | 1 | 2;
  enableReadyCheck?: boolean;
  connectTimeout?: number;
  keepAlive?: number;
  lazyConnect?: boolean;
};

const OVERLAY_IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Prefer REDIS_HOST (Swarm service name) over stale overlay IPs in REDIS_URL. */
export function resolveRedisHost(urlHostname: string, hostOverride?: string): string {
  const override = hostOverride?.trim();
  if (override && override.length > 0) {
    return override;
  }
  return urlHostname;
}

export function isOverlayIpv4Host(hostname: string): boolean {
  return OVERLAY_IPV4.test(hostname);
}

export function redisRetryStrategy(times: number): number | null {
  if (times > 100) {
    return null;
  }
  return Math.min(times * 100, 3_000);
}

export function redisReconnectOnError(error: Error): boolean {
  const message = error.message;
  return (
    message.includes('EHOSTUNREACH') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('ENOTFOUND') ||
    message.includes('READONLY')
  );
}

export function buildRedisConnectionOptions(
  url: string,
  db: number,
  hostOverride?: string,
): RedisConnectionOptions {
  const parsed = new URL(url);
  return {
    host: resolveRedisHost(parsed.hostname, hostOverride),
    port: Number(parsed.port || 6379),
    db,
    maxRetriesPerRequest: null,
    retryStrategy: redisRetryStrategy,
    reconnectOnError: redisReconnectOnError,
    enableReadyCheck: true,
    connectTimeout: 10_000,
    keepAlive: 30_000,
    lazyConnect: false,
  };
}

/** @deprecated Use buildRedisConnectionOptions — kept for call sites migrating gradually. */
export function parseRedisUrl(
  url: string,
  db: number,
  hostOverride?: string,
): RedisConnectionOptions {
  return buildRedisConnectionOptions(url, db, hostOverride);
}
