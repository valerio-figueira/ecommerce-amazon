import { loadDotenvFromMonorepoRoot } from '@ecommerce-amazon/infrastructure';

import { buildServer } from './server.js';

loadDotenvFromMonorepoRoot();

async function main(): Promise<void> {
  const { app, container } = await buildServer();
  const port = container.env.API_PORT;
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
