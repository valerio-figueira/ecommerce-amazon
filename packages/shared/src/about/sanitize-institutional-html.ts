import DOMPurify from 'isomorphic-dompurify';

import { isRecord } from '../utils/type-guards.js';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'] as const;
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'] as const;

export function sanitizeInstitutionalHtml(raw: string): string {
  return String(
    DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [...ALLOWED_TAGS],
      ALLOWED_ATTR: [...ALLOWED_ATTR],
      ALLOW_DATA_ATTR: false,
    }),
  );
}

export function sanitizeInstitutionalPlainText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.includes('<')) {
    return trimmed;
  }
  return sanitizeInstitutionalHtml(trimmed);
}

function sanitizeRecord(value: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...value };

  for (const [key, item] of Object.entries(result)) {
    if (typeof item === 'string') {
      result[key] = sanitizeInstitutionalPlainText(item);
    } else if (Array.isArray(item)) {
      result[key] = item.map((entry: string | Record<string, unknown>) =>
        typeof entry === 'string'
          ? sanitizeInstitutionalPlainText(entry)
          : isRecord(entry)
            ? sanitizeRecord(entry)
            : entry,
      );
    } else if (isRecord(item)) {
      result[key] = sanitizeRecord(item);
    }
  }

  return result;
}

export function sanitizeInstitutionalContentRecord(
  content: Record<string, unknown>,
): Record<string, unknown> {
  return isRecord(content) ? sanitizeRecord(content) : content;
}

/** @deprecated Use sanitizeInstitutionalContentRecord */
export const sanitizeAboutPageContentRecord = sanitizeInstitutionalContentRecord;
