import {
  AuthenticationError,
  OperatorStatus,
  type AuthTokenService,
  type OperatorRepository,
  type PasswordHasher,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export type AuthenticatedOperator = {
  token: string;
  operator: {
    id: string;
    email: string;
    name: string;
  };
};

export class AuthenticateOperator {
  constructor(
    private readonly operatorRepository: OperatorRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<Result<AuthenticatedOperator, AuthenticationError>> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const operator = await this.operatorRepository.findByEmail(normalizedEmail);

    if (!operator || operator.status !== OperatorStatus.ACTIVE) {
      return err(new AuthenticationError());
    }

    const passwordMatches = await this.passwordHasher.verify(
      input.password,
      operator.passwordHash,
    );

    if (!passwordMatches) {
      return err(new AuthenticationError());
    }

    const token = await this.authTokenService.sign({
      sub: operator.id,
      email: operator.email,
      name: operator.name,
    });

    return ok({
      token,
      operator: {
        id: operator.id,
        email: operator.email,
        name: operator.name,
      },
    });
  }
}
