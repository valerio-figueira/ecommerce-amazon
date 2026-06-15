import type { ObjectStorage } from '@ecommerce-amazon/domain';

import { buildAdminImageObjectKey } from './build-admin-image-object-key.js';
import { mimeToImageExtension, validateAdminImage } from './validate-admin-image.js';

export type UploadAdminImageInput = {
  buffer: Buffer;
  mime: string;
};

export type UploadAdminImageResult = {
  url: string;
};

export class UploadAdminImage {
  constructor(private readonly objectStorage: ObjectStorage) {}

  async execute(input: UploadAdminImageInput): Promise<UploadAdminImageResult> {
    validateAdminImage(input.buffer, input.mime);

    const ext = mimeToImageExtension(input.mime);
    const key = buildAdminImageObjectKey(ext);
    const stored = await this.objectStorage.put({
      key,
      body: input.buffer,
      contentType: input.mime,
    });

    return { url: stored.publicUrl };
  }
}
