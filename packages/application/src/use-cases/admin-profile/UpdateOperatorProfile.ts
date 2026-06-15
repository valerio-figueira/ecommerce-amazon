import {
  EntityNotFoundError,
  ValidationError,
  type AuthTokenService,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

export type UpdateOperatorProfileInput = {
  operatorId: string;
  name: string;
  bio: string | null;
};

export type UpdateOperatorProfileResult = {
  operator: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
    status: string;
    isManagedAvatar: boolean;
  };
  token: string;
};

export class UpdateOperatorProfile {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly isManagedAvatarUrl: (url: string) => boolean,
  ) {}

  async execute(input: UpdateOperatorProfileInput): Promise<UpdateOperatorProfileResult> {
    const name = input.name.trim();
    const bio = input.bio?.trim() ? input.bio.trim() : null;

    if (name.length < 1 || name.length > 120) {
      throw new ValidationError('O nome deve ter entre 1 e 120 caracteres.');
    }

    if (bio !== null && bio.length > 250) {
      throw new ValidationError('A bio deve ter no máximo 250 caracteres.');
    }

    const existing = await this.operatorRepository.findById(input.operatorId);
    if (!existing) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    const operator = await this.operatorRepository.updateProfile(input.operatorId, { name, bio });

    const token = await this.authTokenService.sign({
      sub: operator.id,
      email: operator.email,
      name: operator.name,
    });

    return {
      operator: {
        id: operator.id,
        email: operator.email,
        name: operator.name,
        avatarUrl: operator.avatarUrl,
        bio: operator.bio,
        role: operator.role,
        status: operator.status,
        isManagedAvatar: operator.avatarUrl ? this.isManagedAvatarUrl(operator.avatarUrl) : false,
      },
      token,
    };
  }
}
