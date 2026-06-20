#!/usr/bin/env node
/**
 * Build workspace packages when dist/ is missing (Vitest resolves via package exports).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const packageArtifacts = {
  '@ecommerce-amazon/domain': 'packages/domain/dist/index.js',
  '@ecommerce-amazon/shared': 'packages/shared/dist/index.js',
  '@ecommerce-amazon/application': 'packages/application/dist/index.js',
  '@ecommerce-amazon/infrastructure': 'packages/infrastructure/dist/index.js',
};

const buildOrder = [
  '@ecommerce-amazon/domain',
  '@ecommerce-amazon/shared',
  '@ecommerce-amazon/application',
  '@ecommerce-amazon/infrastructure',
];

const profiles = {
  unit: ['@ecommerce-amazon/domain', '@ecommerce-amazon/shared'],
  integration: [
    '@ecommerce-amazon/domain',
    '@ecommerce-amazon/shared',
    '@ecommerce-amazon/application',
    '@ecommerce-amazon/infrastructure',
  ],
};

const profile = process.argv[2] ?? 'unit';
const requiredPackages = profiles[profile] ?? profiles.unit;

function artifactExists(pkg) {
  return existsSync(path.join(root, packageArtifacts[pkg]));
}

const packagesToBuild = requiredPackages.filter((pkg) => !artifactExists(pkg));

if (packagesToBuild.length === 0) {
  process.exit(0);
}

for (const pkg of buildOrder) {
  if (!requiredPackages.includes(pkg)) {
    continue;
  }

  if (artifactExists(pkg)) {
    continue;
  }

  console.log(`\n> Building ${pkg} (required for vitest)...`);
  const result = spawnSync('npm', ['run', 'build', '-w', pkg], {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
