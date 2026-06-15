export type StoredObject = {
  key: string;
  publicUrl: string;
};

export interface ObjectStorage {
  put(params: { key: string; body: Buffer; contentType: string }): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  isManagedUrl(url: string): boolean;
  extractKeyFromUrl(url: string): string | null;
}

export const ADMIN_AVATAR_KEY_PREFIX = 'admin-avatars/';
