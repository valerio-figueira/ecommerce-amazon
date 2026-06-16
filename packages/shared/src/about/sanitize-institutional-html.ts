import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'] as const;
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel'] as const;

export function sanitizeInstitutionalHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeInstitutionalPlainText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.includes('<')) {
    return trimmed;
  }
  return sanitizeInstitutionalHtml(trimmed);
}

export function sanitizeAboutPageContentStrings<T extends Record<string, unknown>>(content: T): T {
  if (typeof content !== 'object' || content === null) {
    return content;
  }

  const result: Record<string, unknown> = { ...content };

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInstitutionalPlainText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInstitutionalPlainText(item)
          : typeof item === 'object' && item !== null
            ? sanitizeAboutPageContentStrings(item as Record<string, unknown>)
            : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeAboutPageContentStrings(value as Record<string, unknown>);
    }
  }

  return result as T;
}
