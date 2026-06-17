import { describe, expect, it } from 'vitest';

import { AesGcmCredentialCipher } from './aes-gcm-credential-cipher.js';

const TEST_KEY = Buffer.alloc(32, 7).toString('base64');

describe('AesGcmCredentialCipher', () => {
  it('round-trips plaintext', () => {
    const cipher = new AesGcmCredentialCipher(TEST_KEY);
    const encrypted = cipher.encrypt('{"secret":"value"}');
    expect(encrypted).not.toContain('secret');
    expect(cipher.decrypt(encrypted)).toBe('{"secret":"value"}');
  });

  it('rejects invalid key length', () => {
    expect(() => new AesGcmCredentialCipher('short')).toThrow();
  });
});
