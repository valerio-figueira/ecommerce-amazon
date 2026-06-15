import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ObjectStorage, StoredObject } from '@ecommerce-amazon/domain';
import { extractManagedKeyFromUrl } from '@ecommerce-amazon/domain';

export class FilesystemObjectStorage implements ObjectStorage {
  constructor(
    private readonly localRoot: string,
    private readonly publicBaseUrl: string,
  ) {}

  async put(params: { key: string; body: Buffer; contentType: string }): Promise<StoredObject> {
    const fullPath = path.join(this.localRoot, params.key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, params.body);

    const publicUrl = this.buildPublicUrl(params.key);
    return { key: params.key, publicUrl };
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.localRoot, key);
    try {
      await unlink(fullPath);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return;
      }
      throw error;
    }
  }

  isManagedUrl(url: string): boolean {
    return this.extractKeyFromUrl(url) !== null;
  }

  extractKeyFromUrl(url: string): string | null {
    return extractManagedKeyFromUrl(url, this.publicBaseUrl);
  }

  private buildPublicUrl(key: string): string {
    const base = this.publicBaseUrl.replace(/\/+$/, '');
    return `${base}/${key.replace(/^\/+/, '')}`;
  }
}
