#!/usr/bin/env node
/**
 * Typecheck Next.js apps with the same tsconfig used by `next build`.
 * ESLint typed lint uses separate tsconfig.eslint-* files and misses some app errors.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const apps = [
  { name: 'web', tsconfig: 'apps/web/tsconfig.json' },
  { name: 'admin', tsconfig: 'apps/admin/tsconfig.json' },
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('node', ['scripts/ensure-packages-built.mjs', 'unit']);

for (const app of apps) {
  console.log(`\n> typecheck ${app.name} (tsc --noEmit -p ${app.tsconfig})`);
  run('npx', ['tsc', '--noEmit', '-p', app.tsconfig]);
}
