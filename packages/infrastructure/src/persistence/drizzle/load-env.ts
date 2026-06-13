import { config } from 'dotenv';
import path from 'node:path';

export function loadDotenvFromMonorepoRoot(): void {
  const monorepoRoot = path.resolve(process.cwd(), '../..');
  config({ path: path.join(monorepoRoot, '.env') });
}
