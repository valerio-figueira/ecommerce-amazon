import {
  EntityNotFoundError,
  type ObjectStorage,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

import { buildAvatarObjectKey } from './build-avatar-object-key.js';
import { mimeToAvatarExtension, validateAvatarImage } from './validate-avatar-image.js';

export type UploadOperatorAvatarInput = {
  operatorId: string;
  buffer: Buffer;
  mime: string;
};

export type UploadOperatorAvatarResult = {
  avatarUrl: string;
  isManagedAvatar: true;
};

export class UploadOperatorAvatar {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly objectStorage: ObjectStorage,
  ) {}

  async execute(input: UploadOperatorAvatarInput): Promise<UploadOperatorAvatarResult> {
    validateAvatarImage(input.buffer, input.mime);

    const operator = await this.operatorRepository.findById(input.operatorId);
    if (!operator) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    const ext = mimeToAvatarExtension(input.mime);
    const key = buildAvatarObjectKey(ext);
    const stored = await this.objectStorage.put({
      key,
      body: input.buffer,
      contentType: input.mime,
    });

    if (operator.avatarUrl && this.objectStorage.isManagedUrl(operator.avatarUrl)) {
      const previousKey = this.objectStorage.extractKeyFromUrl(operator.avatarUrl);
      if (previousKey) {
        await this.objectStorage.delete(previousKey).catch(() => undefined);
      }
    }

    await this.operatorRepository.updateAvatarUrl(operator.id, stored.publicUrl);

    return {
      avatarUrl: stored.publicUrl,
      isManagedAvatar: true,
    };
  }
}
