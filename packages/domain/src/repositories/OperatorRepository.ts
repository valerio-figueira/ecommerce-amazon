import type { Operator } from '../entities/Operator.js';
import type { OperatorSocialLinks } from '../entities/Operator.js';
import type { TeamPublicRole, OperatorRole, OperatorStatus } from '../enums/index.js';

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

export type CreateOperatorData = {
  email: string;
  passwordHash: string;
  name: string;
  role: OperatorRole;
};

export type UpdateOperatorAccessData = {
  role?: OperatorRole;
  status?: OperatorStatus;
};

export interface OperatorRepository {
  findByEmail(email: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
  findAll(): Promise<Operator[]>;
  countActiveAdmins(excludeId?: string): Promise<number>;
  findPublicTeamMembers(): Promise<PublicTeamMember[]>;
  create(data: CreateOperatorData): Promise<Operator>;
  updateProfile(id: string, data: UpdateOperatorProfileData): Promise<Operator>;
  updateAvatarUrl(id: string, avatarUrl: string | null): Promise<Operator>;
  updateAccess(id: string, data: UpdateOperatorAccessData): Promise<Operator>;
  updatePasswordHash(id: string, passwordHash: string): Promise<Operator>;
}
