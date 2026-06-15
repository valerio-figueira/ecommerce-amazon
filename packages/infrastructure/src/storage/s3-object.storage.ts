import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { ObjectStorage, StoredObject } from '@ecommerce-amazon/domain';
import { extractManagedKeyFromUrl } from '@ecommerce-amazon/domain';

export type S3ObjectStorageConfig = {
  bucket: string;
  region: string;
  publicBaseUrl: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly config: S3ObjectStorageConfig) {
    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.region,
    };

    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  async put(params: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );

    const publicUrl = this.buildPublicUrl(params.key);
    return { key: params.key, publicUrl };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );
  }

  isManagedUrl(url: string): boolean {
    return this.extractKeyFromUrl(url) !== null;
  }

  extractKeyFromUrl(url: string): string | null {
    return extractManagedKeyFromUrl(url, this.config.publicBaseUrl);
  }

  private buildPublicUrl(key: string): string {
    const base = this.config.publicBaseUrl.replace(/\/+$/, '');
    return `${base}/${key.replace(/^\/+/, '')}`;
  }
}
