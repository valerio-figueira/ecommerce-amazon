import { OperatorStatus, OperatorRole } from '../enums/index.js';

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
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
