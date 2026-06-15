import { randomBytes } from 'node:crypto';

import { ADMIN_MEDIA_KEY_PREFIX } from '@ecommerce-amazon/domain';

export function buildAdminImageObjectKey(ext: string): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = randomBytes(16).toString('hex');
  const safeExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';

  return `${ADMIN_MEDIA_KEY_PREFIX}${year}/${month}/image-${rand}.${safeExt}`;
}
