import { DomainError, type ObjectStorage } from '@ecommerce-amazon/domain';
import type { Env } from '@ecommerce-amazon/shared';

import { FilesystemObjectStorage } from './filesystem-object.storage.js';
import { GcsObjectStorage, type GcsObjectStorageConfig } from './gcs-object.storage.js';
import { S3ObjectStorage, type S3ObjectStorageConfig } from './s3-object.storage.js';

function resolvePublicBaseUrl(env: Env): string {
  if (env.STORAGE_PUBLIC_BASE_URL) {
    return env.STORAGE_PUBLIC_BASE_URL;
  }

  if (env.STORAGE_DRIVER === 'filesystem') {
    return `http://localhost:${env.API_PORT}/uploads`;
  }

  if (env.STORAGE_DRIVER === 's3' && env.AWS_S3_BUCKET) {
    const region = env.AWS_S3_REGION;
    return `https://${env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com`;
  }

  if (env.STORAGE_DRIVER === 'gcs' && env.GCS_BUCKET) {
    return `https://storage.googleapis.com/${env.GCS_BUCKET}`;
  }

  return `http://localhost:${env.API_PORT}/uploads`;
}

export function createObjectStorage(env: Env): ObjectStorage {
  const publicBaseUrl = resolvePublicBaseUrl(env);

  switch (env.STORAGE_DRIVER) {
    case 'filesystem':
      return new FilesystemObjectStorage(env.STORAGE_LOCAL_ROOT, publicBaseUrl);

    case 's3': {
      if (!env.AWS_S3_BUCKET) {
        throw new DomainError('AWS_S3_BUCKET is required when STORAGE_DRIVER=s3', 'STORAGE_CONFIG');
      }
      const s3Config: S3ObjectStorageConfig = {
        bucket: env.AWS_S3_BUCKET,
        region: env.AWS_S3_REGION,
        publicBaseUrl,
      };
      if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
        s3Config.accessKeyId = env.AWS_ACCESS_KEY_ID;
        s3Config.secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
      }
      return new S3ObjectStorage(s3Config);
    }

    case 'gcs': {
      if (!env.GCS_BUCKET) {
        throw new DomainError('GCS_BUCKET is required when STORAGE_DRIVER=gcs', 'STORAGE_CONFIG');
      }
      const gcsConfig: GcsObjectStorageConfig = {
        bucket: env.GCS_BUCKET,
        publicBaseUrl,
      };
      if (env.GCS_PROJECT_ID) {
        gcsConfig.projectId = env.GCS_PROJECT_ID;
      }
      return new GcsObjectStorage(gcsConfig);
    }

    default:
      throw new DomainError(`Unsupported STORAGE_DRIVER: ${env.STORAGE_DRIVER}`, 'STORAGE_CONFIG');
  }
}
