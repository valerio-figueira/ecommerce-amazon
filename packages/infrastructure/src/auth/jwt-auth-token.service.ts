import { SignJWT, jwtVerify } from 'jose';

import type { AuthTokenPayload, AuthTokenService } from '@ecommerce-amazon/domain';

export class JwtAuthTokenService implements AuthTokenService {
  private readonly secretKey: Uint8Array;

  constructor(
    secret: string,
    private readonly expiresIn: string = '8h',
  ) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async sign(payload: AuthTokenPayload): Promise<string> {
    return new SignJWT({
      email: payload.email,
      name: payload.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secretKey);
  }

  async verify(token: string): Promise<AuthTokenPayload> {
    const { payload } = await jwtVerify(token, this.secretKey, {
      algorithms: ['HS256'],
    });

    const sub = payload.sub;
    const email = payload['email'];
    const name = payload['name'];

    if (typeof sub !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
      throw new Error('Invalid token payload');
    }

    return { sub, email, name };
  }
}
