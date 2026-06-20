import { ValidationError } from '@ecommerce-amazon/domain';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function validateAdminImage(buffer: Buffer, mime: string): void {
  const normalizedMime = mime.toLowerCase().trim();

  if (buffer.length < 1 || buffer.length > ADMIN_IMAGE_MAX_BYTES) {
    throw new ValidationError('A imagem deve ter entre 1 byte e 5 MiB.');
  }

  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new ValidationError('Formato de imagem não suportado (use JPG, PNG, GIF ou WebP).');
  }
}

export function mimeToImageExtension(mime: string): string {
  const normalizedMime = mime.toLowerCase().trim();

  switch (normalizedMime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    default:
      throw new ValidationError('Formato de imagem não suportado (use JPG, PNG, GIF ou WebP).');
  }
}
