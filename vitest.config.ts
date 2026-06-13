import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['packages/domain/**/*.test.ts', 'packages/application/**/*.test.ts'],
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
