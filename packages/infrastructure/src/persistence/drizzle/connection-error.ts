type PostgresLikeError = {
  code?: string;
  message?: string;
};

export function formatDatabaseConnectionError(error: unknown, databaseUrl: string): string {
  const pgError = isPostgresError(error) ? error : undefined;
  const code = pgError?.code;
  const message = pgError?.message ?? (error instanceof Error ? error.message : String(error));

  const sanitizedUrl = databaseUrl.replace(/:([^:@/]+)@/, ':***@');

  if (code === '28P01') {
    return [
      'PostgreSQL authentication failed.',
      `Connection: ${sanitizedUrl}`,
      '',
      'The server is reachable, but the user/password in .env do not match.',
      '',
      'Common cause: Docker postgres is running WITHOUT port 5432 mapped, so localhost:5432',
      'still hits the system PostgreSQL (which has no vitrine user).',
      '',
      'Check: npm run db:doctor',
      '',
      'Fix — use Docker postgres on 5432:',
      '  sudo systemctl stop postgresql',
      '  docker compose down && docker compose up -d',
      '  npm run db:setup',
      '',
      'Fix — keep system PostgreSQL on 5432:',
      '  npm run db:init',
      '  npm run db:setup',
    ].join('\n');
  }

  if (code === 'ECONNREFUSED' || message.includes('ECONNREFUSED')) {
    return [
      'PostgreSQL is not reachable.',
      `Connection: ${sanitizedUrl}`,
      '',
      'Start the database first:',
      '  docker compose up -d postgres redis',
      '  npm run db:setup',
    ].join('\n');
  }

  if (code === '3D000') {
    return [
      'PostgreSQL database does not exist.',
      `Connection: ${sanitizedUrl}`,
      '',
      'Create it with:',
      '  psql -U postgres -f scripts/init-local-postgres.sql',
    ].join('\n');
  }

  return message;
}

function isPostgresError(error: unknown): error is PostgresLikeError {
  return typeof error === 'object' && error !== null && ('code' in error || 'message' in error);
}
