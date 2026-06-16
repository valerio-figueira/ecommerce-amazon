import type { Operator } from '../entities/Operator.js';
import type { OperatorSocialLinks } from '../entities/Operator.js';
import type { TeamPublicRole } from '../enums/index.js';

export type { OperatorSocialLinks };

export type UpdateOperatorProfileData = {
  name: string;
  bio: string | null;
  jobTitle: string | null;
  socialLinks: OperatorSocialLinks | null;
  showOnTeam: boolean;
  teamSortOrder: number | null;
  teamPublicRole: TeamPublicRole;
};

export type PublicTeamMember = {
  name: string;
  jobTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: OperatorSocialLinks | null;
  publicTeamRole: TeamPublicRole;
};

export interface OperatorRepository {
  findByEmail(email: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
  findPublicTeamMembers(): Promise<PublicTeamMember[]>;
  updateProfile(id: string, data: UpdateOperatorProfileData): Promise<Operator>;
  updateAvatarUrl(id: string, avatarUrl: string | null): Promise<Operator>;
}
