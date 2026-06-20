import { buildWorkerContainer } from '@ecommerce-amazon/infrastructure';

import { startWorkers } from './processors/index.js';
import { registerSchedulers } from './schedulers/index.js';

async function main() {
  const container = buildWorkerContainer();
  container.logger.info('Starting worker processes');

  startWorkers(container);
  await registerSchedulers(container);

  const shutdown = () => {
    container.logger.info('Shutting down worker');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
