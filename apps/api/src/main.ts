import { buildServer } from './server.js';

async function main() {
  const { app, container } = await buildServer();
  const port = container.env.API_PORT;
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
