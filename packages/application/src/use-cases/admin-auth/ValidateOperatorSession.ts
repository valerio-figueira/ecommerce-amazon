import {
  AuthenticationError,
  OperatorStatus,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export type ValidatedOperatorSession = {
  id: string;
  email: string;
  name: string;
};

export class ValidateOperatorSession {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(operatorId: string): Promise<Result<ValidatedOperatorSession, AuthenticationError>> {
    const operator = await this.operatorRepository.findById(operatorId);

    if (!operator || operator.status !== OperatorStatus.ACTIVE) {
      return err(new AuthenticationError('Unauthorized'));
    }

    return ok({
      id: operator.id,
      email: operator.email,
      name: operator.name,
    });
  }
}
