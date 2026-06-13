export type RedisConnectionOptions = {
  host: string;
  port: number;
  db: number;
  maxRetriesPerRequest: null;
};

export function parseRedisUrl(url: string, db: number): RedisConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    db,
    maxRetriesPerRequest: null,
  };
}
