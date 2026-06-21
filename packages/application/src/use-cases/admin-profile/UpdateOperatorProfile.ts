import {
  EntityNotFoundError,
  TeamPublicRole,
  ValidationError,
  type AuthTokenService,
  type OperatorRepository,
  type OperatorSocialLinks,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';

import { buildAboutTeamRevalidationOptions } from '../../cache/public-cache.helpers.js';

function mapOperatorProfile(
  operator: Awaited<ReturnType<OperatorRepository['findById']>>,
  isManagedAvatarUrl: (url: string) => boolean,
) {
  if (!operator) {
    throw new EntityNotFoundError('Operator', 'unknown');
  }

  return {
    id: operator.id,
    email: operator.email,
    name: operator.name,
    avatarUrl: operator.avatarUrl,
    bio: operator.bio,
    role: operator.role,
    status: operator.status,
    isManagedAvatar: operator.avatarUrl ? isManagedAvatarUrl(operator.avatarUrl) : false,
    jobTitle: operator.jobTitle,
    socialLinks: operator.socialLinks,
    showOnTeam: operator.showOnTeam,
    teamSortOrder: operator.teamSortOrder,
    publicTeamRole: operator.teamPublicRole,
  };
}

export type UpdateOperatorProfileInput = {
  operatorId: string;
  name: string;
  bio: string | null;
  jobTitle: string | null;
  socialLinks: OperatorSocialLinks | null;
  showOnTeam: boolean;
  teamSortOrder: number | null;
  publicTeamRole: TeamPublicRole;
};

export type UpdateOperatorProfileResult = {
  operator: ReturnType<typeof mapOperatorProfile>;
  token: string;
};

export class UpdateOperatorProfile {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly isManagedAvatarUrl: (url: string) => boolean,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: UpdateOperatorProfileInput): Promise<UpdateOperatorProfileResult> {
    const name = input.name.trim();
    const bio = input.bio?.trim() ? input.bio.trim() : null;
    const jobTitle = input.jobTitle?.trim() ? input.jobTitle.trim() : null;

    if (name.length < 1 || name.length > 120) {
      throw new ValidationError('O nome deve ter entre 1 e 120 caracteres.');
    }

    if (bio !== null && bio.length > 250) {
      throw new ValidationError('A bio deve ter no máximo 250 caracteres.');
    }

    if (jobTitle !== null && jobTitle.length > 120) {
      throw new ValidationError('O cargo público deve ter no máximo 120 caracteres.');
    }

    const existing = await this.operatorRepository.findById(input.operatorId);
    if (!existing) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    const operator = await this.operatorRepository.updateProfile(input.operatorId, {
      name,
      bio,
      jobTitle,
      socialLinks: input.socialLinks,
      showOnTeam: input.showOnTeam,
      teamSortOrder: input.teamSortOrder,
      teamPublicRole: input.publicTeamRole,
    });

    const token = await this.authTokenService.sign({
      sub: operator.id,
      email: operator.email,
      name: operator.name,
    });

    await this.webRevalidator.revalidate(buildAboutTeamRevalidationOptions());

    return {
      operator: mapOperatorProfile(operator, this.isManagedAvatarUrl),
      token,
    };
  }
}
