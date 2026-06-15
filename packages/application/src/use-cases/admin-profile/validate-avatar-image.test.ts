import { describe, expect, it } from 'vitest';

import { ValidationError } from '@ecommerce-amazon/domain';

import {
  mimeToAvatarExtension,
  validateAvatarImage,
} from './validate-avatar-image.js';

describe('validateAvatarImage', () => {
  it('accepts supported mime types within size limit', () => {
    expect(() => validateAvatarImage(Buffer.from('abc'), 'image/jpeg')).not.toThrow();
  });

  it('rejects unsupported mime types', () => {
    expect(() => validateAvatarImage(Buffer.from('abc'), 'image/bmp')).toThrow(ValidationError);
  });

  it('rejects files larger than 5 MiB', () => {
    const huge = Buffer.alloc(5 * 1024 * 1024 + 1);
    expect(() => validateAvatarImage(huge, 'image/png')).toThrow(ValidationError);
  });
});

describe('mimeToAvatarExtension', () => {
  it('maps jpeg to jpg', () => {
    expect(mimeToAvatarExtension('image/jpeg')).toBe('jpg');
  });
});
