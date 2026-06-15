import { randomBytes } from 'node:crypto';

import { ADMIN_AVATAR_KEY_PREFIX } from '@ecommerce-amazon/domain';

export function buildAvatarObjectKey(ext: string): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  const rand = randomBytes(16).toString('hex');
  const safeExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';

  return `${ADMIN_AVATAR_KEY_PREFIX}${year}/${month}/avatar-${datePart}-${timePart}-${rand}.${safeExt}`;
}
