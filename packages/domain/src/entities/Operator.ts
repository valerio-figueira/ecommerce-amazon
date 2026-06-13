import { OperatorStatus } from '../enums/index.js';

export class Operator {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly status: OperatorStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
