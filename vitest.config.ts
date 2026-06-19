import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const adminSrc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'apps/admin/src');

export default defineConfig({
  resolve: {
    alias: {
      '@': adminSrc,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            'packages/domain/**/*.test.ts',
            'packages/application/**/*.test.ts',
            'packages/shared/**/*.test.ts',
            'apps/admin/src/**/*.test.ts',
            'apps/web/src/**/*.test.ts',
            'apps/api/src/adapters/presenters/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['apps/api/**/*.test.ts', 'packages/infrastructure/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
