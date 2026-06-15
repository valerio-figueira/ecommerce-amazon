import { Storage } from '@google-cloud/storage';

import type { ObjectStorage, StoredObject } from '@ecommerce-amazon/domain';
import { extractManagedKeyFromUrl } from '@ecommerce-amazon/domain';

export type GcsObjectStorageConfig = {
  bucket: string;
  projectId?: string;
  publicBaseUrl: string;
};

export class GcsObjectStorage implements ObjectStorage {
  private readonly storage: Storage;
  private readonly bucket: ReturnType<Storage['bucket']>;

  constructor(private readonly config: GcsObjectStorageConfig) {
    this.storage = new Storage(config.projectId ? { projectId: config.projectId } : {});
    this.bucket = this.storage.bucket(config.bucket);
  }

  async put(params: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    const file = this.bucket.file(params.key);
    await file.save(params.body, {
      contentType: params.contentType,
      resumable: false,
    });

    const publicUrl = this.buildPublicUrl(params.key);
    return { key: params.key, publicUrl };
  }

  async delete(key: string): Promise<void> {
    const file = this.bucket.file(key);
    try {
      await file.delete();
    } catch (error) {
      if (error instanceof Error && error.message.includes('No such object')) {
        return;
      }
      throw error;
    }
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
