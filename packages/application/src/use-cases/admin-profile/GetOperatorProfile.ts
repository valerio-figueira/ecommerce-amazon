import {
  EntityNotFoundError,
  type OperatorRepository,
  type OperatorRole,
  type OperatorStatus,
} from '@ecommerce-amazon/domain';

export type OperatorProfileDto = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  role: OperatorRole;
  status: OperatorStatus;
  isManagedAvatar: boolean;
};

export class GetOperatorProfile {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly isManagedAvatarUrl: (url: string) => boolean,
  ) {}

  async execute(operatorId: string): Promise<OperatorProfileDto> {
    const operator = await this.operatorRepository.findById(operatorId);
    if (!operator) {
      throw new EntityNotFoundError('Operator', operatorId);
    }

    return {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      avatarUrl: operator.avatarUrl,
      bio: operator.bio,
      role: operator.role,
      status: operator.status,
      isManagedAvatar: operator.avatarUrl ? this.isManagedAvatarUrl(operator.avatarUrl) : false,
    };
  }
}
