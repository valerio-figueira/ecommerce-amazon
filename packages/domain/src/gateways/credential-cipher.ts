export interface CredentialCipher {
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
}
