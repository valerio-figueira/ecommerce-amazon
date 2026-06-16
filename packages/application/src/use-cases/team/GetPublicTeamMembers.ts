import { TeamPublicRole, type OperatorRepository } from '@ecommerce-amazon/domain';

export type GetPublicTeamMembersResult = {
  members: Array<{
    name: string;
    jobTitle: string | null;
    bio: string | null;
    avatarUrl: string | null;
    socialLinks: {
      linkedin?: string;
      instagram?: string;
      x?: string;
      telegram?: string;
    } | null;
    publicTeamRole: TeamPublicRole;
  }>;
};

export class GetPublicTeamMembers {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(): Promise<GetPublicTeamMembersResult> {
    const members = await this.operatorRepository.findPublicTeamMembers();
    return { members };
  }
}
