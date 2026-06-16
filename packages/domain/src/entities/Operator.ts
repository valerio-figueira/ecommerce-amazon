import { OperatorStatus, OperatorRole, TeamPublicRole } from '../enums/index.js';

export type OperatorSocialLinks = {
  linkedin?: string;
  instagram?: string;
  x?: string;
  telegram?: string;
};

export class Operator {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly avatarUrl: string | null,
    readonly bio: string | null,
    readonly role: OperatorRole,
    readonly status: OperatorStatus,
    readonly jobTitle: string | null,
    readonly socialLinks: OperatorSocialLinks | null,
    readonly showOnTeam: boolean,
    readonly teamSortOrder: number | null,
    readonly teamPublicRole: TeamPublicRole,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
