import type { Operator } from '../entities/Operator.js';

export interface OperatorRepository {
  findByEmail(email: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
}
