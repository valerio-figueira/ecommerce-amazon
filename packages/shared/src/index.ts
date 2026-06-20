import { z } from 'zod';

export {
  createCorsOriginDelegate,
  isDevWebOrigin,
  isOriginAllowed,
  parseCorsOrigins,
  type CorsOriginDelegate,
} from './cors.js';

export type DatabaseConfig = {
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
};

export function buildDatabaseUrl(config: DatabaseConfig): string {
  const user = encodeURIComponent(config.POSTGRES_USER);
  const password = encodeURIComponent(config.POSTGRES_PASSWORD);
  return `postgresql://${user}:${password}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`;
}

const envSchemaBase = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().default('vitrine'),
  POSTGRES_PASSWORD: z.string().default('vitrine'),
  POSTGRES_DB: z.string().default('vitrine'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_URL: z.string().url().optional(),
  REDIS_CACHE_DB: z.coerce.number().int().min(0).max(15).default(0),
  REDIS_QUEUE_DB: z.coerce.number().int().min(0).max(15).default(1),
  REDIS_TELEMETRY_DB: z.coerce.number().int().min(0).max(15).default(2),
  TELEMETRY_BUFFER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  TELEMETRY_FLUSH_BATCH_SIZE: z.coerce.number().int().positive().default(5000),
  TELEMETRY_FLUSH_CRON: z.string().default('*/5 * * * *'),
  TELEMETRY_BUFFER_MAX_LEN: z.coerce.number().int().positive().default(100_000),
  API_PORT: z.coerce.number().int().positive().default(3000),
  AMAZON_AFFILIATE_TAG: z.string().default(''),
  SHOPEE_AFFILIATE_ID: z.string().default(''),
  EMAIL_FROM: z.string().email().default('noreply@example.com'),
  RESEND_API_KEY: z.string().default(''),
  SEED_FORCE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  CORS_ORIGINS: z.string().default('http://localhost:3001,http://localhost:3002'),
  WEB_PORT: z.coerce.number().int().positive().default(3001),
  ADMIN_PORT: z.coerce.number().int().positive().default(3002),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  ADMIN_SEED_EMAIL: z.string().email().default('admin@vitrine.local'),
  ADMIN_SEED_PASSWORD: z.string().min(8).default('vitrine-admin'),
  PASSWORD_PEPPER: z
    .string()
    .min(16)
    .default('dev-pepper-change-in-production-min-16-chars'),
  ENCRYPTION_KEY: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().default('AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE='),
  ),
  REVALIDATE_SECRET: z.string().default(''),
  WEB_PUBLIC_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SITE_NAME: z.string().default('Vitrine'),
  NEXT_PUBLIC_SITE_NAME: z.string().optional(),
  COMPANY_LEGAL_NAME: z.string().default('Vitrine Ltda'),
  CONTACT_EMAIL: z.string().email().default('contato@vitrine.com.br'),
  SITE_TAGLINE: z.string().default('Curadoria inteligente'),
  SITE_SOCIAL_INSTAGRAM: z.string().url().default('https://instagram.com/vitrine'),
  SITE_SOCIAL_TELEGRAM: z.string().url().default('https://t.me/vitrine_ofertas'),
  STORAGE_DRIVER: z.enum(['filesystem', 's3', 'gcs']).default('filesystem'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().optional(),
  STORAGE_LOCAL_ROOT: z.string().default('./uploads'),
  AWS_S3_BUCKET: z.string().default(''),
  AWS_S3_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  GCS_BUCKET: z.string().default(''),
  GCS_PROJECT_ID: z.string().default(''),
});

export const envSchema = envSchemaBase.transform((data) => ({
  ...data,
  DATABASE_URL: data.DATABASE_URL ?? buildDatabaseUrl(data),
  REDIS_URL: data.REDIS_URL ?? `redis://${data.REDIS_HOST}:${data.REDIS_PORT}`,
  WEB_PUBLIC_URL:
    data.WEB_PUBLIC_URL ?? data.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${data.WEB_PORT}`,
}));

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export function createConsoleLogger(): Logger {
  /* eslint-disable no-console -- intentional console sink for dev/worker bootstrap */
  return {
    info: (message, meta) => console.log(message, meta ?? ''),
    warn: (message, meta) => console.warn(message, meta ?? ''),
    error: (message, meta) => console.error(message, meta ?? ''),
    debug: (message, meta) => console.debug(message, meta ?? ''),
  };
  /* eslint-enable no-console */
}

export {
  buildNextImageRemotePatterns,
  collectImageRemoteBaseUrls,
  isNextImageRemoteUrl,
  type NextImageRemoteEnv,
  type NextImageRemotePattern,
} from './next-image/index.js';

export {
  BRAND_DEFAULTS,
  createBrandConfig,
  formatAdminPageTitle,
  formatCopyrightNotice,
  formatEditorialTeamName,
  formatWebHomeTitle,
  formatWebPageTitle,
  createClientBrandEnvSource,
  getBrandConfig,
  getClientBrandConfig,
  type BrandConfig,
  type BrandEnvSource,
  type BrandSocials,
} from './config/brand.js';
