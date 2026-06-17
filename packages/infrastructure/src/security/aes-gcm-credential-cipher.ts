import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { ValidationError, type CredentialCipher } from '@ecommerce-amazon/domain';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function parseEncryptionKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ValidationError('ENCRYPTION_KEY is required for marketplace credential vault');
  }

  const base64 = Buffer.from(trimmed, 'base64');
  if (base64.length === 32) {
    return base64;
  }

  const hex = Buffer.from(trimmed, 'hex');
  if (hex.length === 32) {
    return hex;
  }

  throw new ValidationError(
    'ENCRYPTION_KEY must be 32 bytes when base64- or hex-decoded (generate: openssl rand -base64 32)',
  );
}

export class AesGcmCredentialCipher implements CredentialCipher {
  private readonly key: Buffer;

  constructor(encryptionKey: string) {
    this.key = parseEncryptionKey(encryptionKey);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    const payload = Buffer.from(ciphertext, 'base64');
    if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new ValidationError('Invalid encrypted credential payload');
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

export function createCredentialCipher(encryptionKey: string): CredentialCipher {
  return new AesGcmCredentialCipher(encryptionKey);
}
