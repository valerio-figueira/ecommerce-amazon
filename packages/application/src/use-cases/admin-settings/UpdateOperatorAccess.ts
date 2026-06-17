import {
  EntityNotFoundError,
  OperatorRole,
  OperatorStatus,
  ValidationError,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

import type { OperatorSummaryDto } from './ListOperators.js';
import { ListOperators } from './ListOperators.js';

export type UpdateOperatorAccessInput = {
  operatorId: string;
  actorId: string;
  role?: OperatorRole;
  status?: OperatorStatus;
};

export class UpdateOperatorAccess {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(input: UpdateOperatorAccessInput): Promise<OperatorSummaryDto> {
    const target = await this.operatorRepository.findById(input.operatorId);
    if (!target) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    const nextRole = input.role ?? target.role;
    const nextStatus = input.status ?? target.status;

    if (input.operatorId === input.actorId && nextStatus === OperatorStatus.DISABLED) {
      throw new ValidationError('Você não pode desativar sua própria conta');
    }

    const demotingAdmin =
      target.role === OperatorRole.ADMIN &&
      nextRole !== OperatorRole.ADMIN &&
      nextStatus === OperatorStatus.ACTIVE;

    const disablingAdmin =
      target.role === OperatorRole.ADMIN &&
      nextStatus === OperatorStatus.DISABLED &&
      target.status === OperatorStatus.ACTIVE;

    if (demotingAdmin || disablingAdmin) {
      const remainingAdmins = await this.operatorRepository.countActiveAdmins(input.operatorId);
      if (remainingAdmins === 0) {
        throw new ValidationError('Deve existir ao menos um administrador ativo');
      }
    }

    await this.operatorRepository.updateAccess(input.operatorId, {
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    });

    const mapper = new ListOperators(this.operatorRepository);
    const listed = await mapper.execute();
    const dto = listed.items.find((item) => item.id === input.operatorId);
    if (!dto) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    return dto;
  }
}
