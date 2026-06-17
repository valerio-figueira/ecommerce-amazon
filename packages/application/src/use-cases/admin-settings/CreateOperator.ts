import {
  OperatorRole,
  ValidationError,
  type OperatorRepository,
  type PasswordHasher,
} from '@ecommerce-amazon/domain';

import type { OperatorSummaryDto } from './ListOperators.js';
import { ListOperators } from './ListOperators.js';

export type CreateOperatorInput = {
  email: string;
  name: string;
  password: string;
  role: OperatorRole;
};

export class CreateOperator {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: CreateOperatorInput): Promise<OperatorSummaryDto> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await this.operatorRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ValidationError('E-mail de operador já cadastrado');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const created = await this.operatorRepository.create({
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash,
      role: input.role,
    });

    const mapper = new ListOperators(this.operatorRepository);
    const listed = await mapper.execute();
    const dto = listed.items.find((item) => item.id === created.id);
    if (!dto) {
      throw new ValidationError('Falha ao carregar operador criado');
    }

    return dto;
  }
}
