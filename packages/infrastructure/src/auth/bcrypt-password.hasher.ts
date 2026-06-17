import bcrypt from 'bcryptjs';

import type { PasswordHasher } from '@ecommerce-amazon/domain';

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(
    private readonly pepper: string,
    private readonly rounds = 10,
  ) {
    if (!pepper || pepper.length < 16) {
      throw new Error('PASSWORD_PEPPER must be at least 16 characters');
    }
  }

  private applyPepper(plain: string): string {
    return `${this.pepper}${plain}`;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(this.applyPepper(plain), this.rounds);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(this.applyPepper(plain), hash);
  }
}
