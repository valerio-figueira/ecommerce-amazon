#!/usr/bin/env node
/**
 * Run ESLint per workspace to avoid OOM on typed lint in monorepos.
 */
import { spawnSync } from 'node:child_process';

const targets = [
  'packages/domain/src',
  'packages/shared/src',
  'packages/application/src',
  'packages/infrastructure/src',
  'apps/api/src',
  'apps/worker/src',
  'apps/web/src',
  'apps/web/next.config.ts',
  'apps/admin/src',
  'apps/admin/next.config.ts',
];

const eslintArgs = process.argv.slice(2);
let failed = false;

for (const target of targets) {
  console.log(`\n> eslint ${target}`);
  const result = spawnSync('eslint', [target, ...eslintArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: mergeNodeOptions(process.env.NODE_OPTIONS, '--max-old-space-size=3072'),
    },
  });

  if (result.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);

function mergeNodeOptions(current, option) {
  if (!current) {
    return option;
  }

  if (current.includes('--max-old-space-size')) {
    return current;
  }

  return `${current} ${option}`;
}
