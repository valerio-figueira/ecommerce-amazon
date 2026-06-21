import {
  EntityNotFoundError,
  type ObjectStorage,
  type OperatorRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';

import { buildAboutTeamRevalidationOptions } from '../../cache/public-cache.helpers.js';

export type RemoveOperatorAvatarInput = {
  operatorId: string;
};

export type RemoveOperatorAvatarResult = {
  avatarUrl: null;
  isManagedAvatar: false;
};

export class RemoveOperatorAvatar {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly objectStorage: ObjectStorage,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: RemoveOperatorAvatarInput): Promise<RemoveOperatorAvatarResult> {
    const operator = await this.operatorRepository.findById(input.operatorId);
    if (!operator) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    if (operator.avatarUrl && this.objectStorage.isManagedUrl(operator.avatarUrl)) {
      const key = this.objectStorage.extractKeyFromUrl(operator.avatarUrl);
      if (key) {
        await this.objectStorage.delete(key).catch(() => undefined);
      }
    }

    await this.operatorRepository.updateAvatarUrl(operator.id, null);

    await this.webRevalidator.revalidate(buildAboutTeamRevalidationOptions());

    return {
      avatarUrl: null,
      isManagedAvatar: false,
    };
  }
}
