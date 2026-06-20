import { OperatorRole, type Operator, type OperatorRepository } from '@ecommerce-amazon/domain';

export type OperatorSummaryDto = {
  id: string;
  email: string;
  name: string;
  role: OperatorRole;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function mapOperator(operator: Operator): OperatorSummaryDto {
  return {
    id: operator.id,
    email: operator.email,
    name: operator.name,
    role: operator.role,
    status: operator.status,
    createdAt: operator.createdAt.toISOString(),
    updatedAt: operator.updatedAt.toISOString(),
  };
}

export class ListOperators {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(): Promise<{ items: OperatorSummaryDto[] }> {
    const operators = await this.operatorRepository.findAll();
    return {
      items: operators.map(mapOperator),
    };
  }
}
