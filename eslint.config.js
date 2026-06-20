import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const sharedRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  'no-console': 'warn',
};

const typedProjects = [
  {
    files: ['packages/domain/src/**/*.ts'],
    project: './packages/domain/tsconfig.eslint.json',
  },
  {
    files: ['packages/shared/src/**/*.ts'],
    project: './packages/shared/tsconfig.eslint.json',
  },
  {
    files: ['packages/application/src/**/*.ts'],
    project: './packages/application/tsconfig.eslint.json',
  },
  {
    files: ['packages/infrastructure/src/**/*.ts'],
    project: './packages/infrastructure/tsconfig.eslint.json',
  },
  {
    files: ['apps/api/src/**/*.ts'],
    project: './apps/api/tsconfig.eslint.json',
  },
  {
    files: ['apps/worker/src/**/*.ts'],
    project: './apps/worker/tsconfig.eslint.json',
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}', 'apps/web/next.config.ts'],
    project: './apps/web/tsconfig.eslint.json',
  },
  {
    files: ['apps/admin/src/**/*.{ts,tsx}', 'apps/admin/next.config.ts'],
    project: './apps/admin/tsconfig.eslint.json',
  },
];

export default tseslint.config(
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      'packages/*/src/**/*.js',
      'apps/*/src/**/*.js',
    ],
  },
  ...typedProjects.map(({ files, project }) => ({
    files,
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: sharedRules,
  })),
);
