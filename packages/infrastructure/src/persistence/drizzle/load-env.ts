import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveMonorepoRoot(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(moduleDir, '../../../../..');
}

export function loadDotenvFromMonorepoRoot(): void {
  config({ path: path.join(resolveMonorepoRoot(), '.env') });
}
