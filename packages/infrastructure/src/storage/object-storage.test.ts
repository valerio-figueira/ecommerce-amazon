import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildAvatarObjectKey } from '@ecommerce-amazon/application';
import { extractManagedKeyFromUrl } from '@ecommerce-amazon/domain';

import { FilesystemObjectStorage } from './filesystem-object.storage.js';
import { createObjectStorage } from './object-storage.factory.js';

describe('FilesystemObjectStorage', () => {
  it('stores files and builds managed public URLs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'vitrine-uploads-'));
    const publicBaseUrl = 'http://localhost:3000/uploads';
    const storage = new FilesystemObjectStorage(root, publicBaseUrl);
    const key = buildAvatarObjectKey('jpg');

    try {
      const stored = await storage.put({
        key,
        body: Buffer.from('avatar-bytes'),
        contentType: 'image/jpeg',
      });

      expect(stored.publicUrl).toBe(`${publicBaseUrl}/${key}`);
      expect(storage.isManagedUrl(stored.publicUrl)).toBe(true);
      expect(storage.extractKeyFromUrl(stored.publicUrl)).toBe(key);

      const fileContents = await readFile(path.join(root, key));
      expect(fileContents.toString()).toBe('avatar-bytes');

      await storage.delete(key);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects unmanaged external URLs', () => {
    const storage = new FilesystemObjectStorage('/tmp', 'http://localhost:3000/uploads');
    expect(storage.isManagedUrl('https://example.com/photo.jpg')).toBe(false);
  });
});

describe('extractManagedKeyFromUrl', () => {
  it('extracts key from public base URL with uploads prefix', () => {
    const key = 'admin-avatars/2026/06/avatar-20260615-120000-0123456789abcdef0123456789abcdef.jpg';
    const url = `http://localhost:3000/uploads/${key}`;
    expect(extractManagedKeyFromUrl(url, 'http://localhost:3000/uploads')).toBe(key);
  });
});

describe('createObjectStorage', () => {
  it('defaults to filesystem driver', () => {
    const storage = createObjectStorage({
      NODE_ENV: 'test',
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: 5432,
      POSTGRES_USER: 'vitrine',
      POSTGRES_PASSWORD: 'vitrine',
      POSTGRES_DB: 'vitrine',
      DATABASE_URL: 'postgresql://vitrine:vitrine@localhost:5432/vitrine',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      REDIS_URL: 'redis://localhost:6379',
      REDIS_CACHE_DB: 0,
      REDIS_QUEUE_DB: 1,
      REDIS_TELEMETRY_DB: 2,
      TELEMETRY_BUFFER_ENABLED: true,
      TELEMETRY_FLUSH_BATCH_SIZE: 5000,
      TELEMETRY_FLUSH_CRON: '*/5 * * * *',
      TELEMETRY_BUFFER_MAX_LEN: 100_000,
      API_PORT: 3000,
      AMAZON_AFFILIATE_TAG: '',
      SHOPEE_AFFILIATE_ID: '',
      EMAIL_FROM: 'noreply@example.com',
      RESEND_API_KEY: '',
      SEED_FORCE: false,
      CORS_ORIGINS: 'http://localhost:3001',
      WEB_PORT: 3001,
      ADMIN_PORT: 3002,
      JWT_SECRET: 'test',
      JWT_EXPIRES_IN: '8h',
      ADMIN_SEED_EMAIL: 'admin@vitrine.local',
      ADMIN_SEED_PASSWORD: 'vitrine-admin',
      PASSWORD_PEPPER: 'test-pepper-min-16-chars',
      ENCRYPTION_KEY: 'AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=',
      REVALIDATE_SECRET: '',
      WEB_PUBLIC_URL: 'http://localhost:3001',
      SITE_NAME: 'Vitrine',
      COMPANY_LEGAL_NAME: 'Vitrine Ltda',
      CONTACT_EMAIL: 'contato@vitrine.com.br',
      SITE_TAGLINE: 'Curadoria inteligente',
      SITE_SOCIAL_INSTAGRAM: 'https://instagram.com/vitrine',
      SITE_SOCIAL_TELEGRAM: 'https://t.me/vitrine_ofertas',
      STORAGE_DRIVER: 'filesystem',
      STORAGE_PUBLIC_BASE_URL: undefined,
      STORAGE_LOCAL_ROOT: './uploads',
      AWS_S3_BUCKET: '',
      AWS_S3_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
      GCS_BUCKET: '',
      GCS_PROJECT_ID: '',
    });

    expect(storage.isManagedUrl('http://localhost:3000/uploads/admin-avatars/2026/06/avatar-20260615-120000-0123456789abcdef0123456789abcdef.jpg')).toBe(
      true,
    );
  });
});
