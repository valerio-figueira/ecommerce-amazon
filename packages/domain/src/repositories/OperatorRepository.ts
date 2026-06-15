import type { Operator } from '../entities/Operator.js';

export type UpdateOperatorProfileData = {
  name: string;
  bio: string | null;
};

export interface OperatorRepository {
  findByEmail(email: string): Promise<Operator | null>;
  findById(id: string): Promise<Operator | null>;
  updateProfile(id: string, data: UpdateOperatorProfileData): Promise<Operator>;
  updateAvatarUrl(id: string, avatarUrl: string | null): Promise<Operator>;
}
