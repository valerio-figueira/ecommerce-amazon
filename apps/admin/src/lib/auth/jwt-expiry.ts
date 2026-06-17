const JWT_EXPIRES_PATTERN = /^(\d+)([smhd])$/;

const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
};

export function parseJwtExpiresInToSeconds(value: string): number {
  const match = JWT_EXPIRES_PATTERN.exec(value.trim());
  if (!match) {
    return 8 * 60 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 'h';
  const multiplier = UNIT_SECONDS[unit] ?? UNIT_SECONDS.h;

  return amount * multiplier;
}

export function getSessionCookieMaxAge(): number {
  const expiresIn = process.env['JWT_EXPIRES_IN'] ?? '8h';
  return parseJwtExpiresInToSeconds(expiresIn);
}
