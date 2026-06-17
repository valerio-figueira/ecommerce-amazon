import {
  AuthenticationError,
  EntityNotFoundError,
  ValidationError,
  type OperatorRepository,
  type PasswordHasher,
} from '@ecommerce-amazon/domain';

export type ChangeOperatorPasswordInput = {
  operatorId: string;
  currentPassword: string;
  newPassword: string;
};

export class ChangeOperatorPassword {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ChangeOperatorPasswordInput): Promise<{ ok: true }> {
    const operator = await this.operatorRepository.findById(input.operatorId);
    if (!operator) {
      throw new EntityNotFoundError('Operator', input.operatorId);
    }

    const matches = await this.passwordHasher.verify(
      input.currentPassword,
      operator.passwordHash,
    );

    if (!matches) {
      throw new AuthenticationError();
    }

    if (input.currentPassword === input.newPassword) {
      throw new ValidationError('A nova senha deve ser diferente da atual');
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.operatorRepository.updatePasswordHash(operator.id, passwordHash);

    return { ok: true };
  }
}
