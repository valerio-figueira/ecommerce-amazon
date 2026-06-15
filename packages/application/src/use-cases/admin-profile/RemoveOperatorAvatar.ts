import {
  EntityNotFoundError,
  type ObjectStorage,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

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

    return {
      avatarUrl: null,
      isManagedAvatar: false,
    };
  }
}
