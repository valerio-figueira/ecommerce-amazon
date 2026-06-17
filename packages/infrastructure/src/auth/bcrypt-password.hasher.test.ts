import { describe, expect, it } from 'vitest';

import { BcryptPasswordHasher } from './bcrypt-password.hasher.js';

const TEST_PEPPER = 'dev-pepper-change-in-production-min-16-chars';

describe('BcryptPasswordHasher', () => {
  it('requires a pepper with at least 16 characters', () => {
    expect(() => new BcryptPasswordHasher('short')).toThrow('PASSWORD_PEPPER');
  });

  it('hashes and verifies with pepper applied', async () => {
    const hasher = new BcryptPasswordHasher(TEST_PEPPER);
    const hash = await hasher.hash('secret-password');

    expect(hash).not.toContain('secret-password');
    await expect(hasher.verify('secret-password', hash)).resolves.toBe(true);
    await expect(hasher.verify('wrong-password', hash)).resolves.toBe(false);
  });

  it('does not verify hashes produced without the same pepper', async () => {
    const hasherA = new BcryptPasswordHasher(TEST_PEPPER);
    const hasherB = new BcryptPasswordHasher('another-pepper-value-16c');
    const hash = await hasherA.hash('secret-password');

    await expect(hasherB.verify('secret-password', hash)).resolves.toBe(false);
  });
});
