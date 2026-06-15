import { z } from 'zod';

export const internalLinkTargetTypeSchema = z.enum([
  'product',
  'product_category',
  'collection',
  'article',
  'article_category',
]);

export type InternalLinkTargetType = z.infer<typeof internalLinkTargetTypeSchema>;

export const INTERNAL_LINK_TARGET_MIN_SEARCH_LENGTH = 2;
export const INTERNAL_LINK_TARGET_DEFAULT_PRODUCT_LIMIT = 20;
export const INTERNAL_LINK_TARGET_MAX_PRODUCT_LIMIT = 50;

const URL_PATTERNS: Array<{ type: InternalLinkTargetType; prefix: string }> = [
  { type: 'article_category', prefix: '/artigos/categoria/' },
  { type: 'article', prefix: '/artigos/' },
  { type: 'product', prefix: '/produtos/' },
  { type: 'product_category', prefix: '/categorias/' },
  { type: 'collection', prefix: '/colecoes/' },
];

export function buildInternalLinkTargetUrl(type: InternalLinkTargetType, slug: string): string {
  switch (type) {
    case 'product':
      return `/produtos/${slug}`;
    case 'product_category':
      return `/categorias/${slug}`;
    case 'collection':
      return `/colecoes/${slug}`;
    case 'article':
      return `/artigos/${slug}`;
    case 'article_category':
      return `/artigos/categoria/${slug}`;
  }
}

export function parseInternalLinkTargetUrl(
  url: string,
): { type: InternalLinkTargetType; slug: string } | null {
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  for (const { type, prefix } of URL_PATTERNS) {
    if (!trimmed.startsWith(prefix)) {
      continue;
    }
    const slug = trimmed.slice(prefix.length);
    if (slug.length > 0 && !slug.includes('/')) {
      return { type, slug };
    }
  }

  return null;
}

export const internalLinkTargetDtoSchema = z.object({
  type: internalLinkTargetTypeSchema,
  label: z.string(),
  slug: z.string(),
  targetUrl: z.string(),
  meta: z.string().optional(),
});

export type InternalLinkTargetDto = z.infer<typeof internalLinkTargetDtoSchema>;

export const searchInternalLinkTargetsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  productLimit: z.coerce
    .number()
    .int()
    .min(1)
    .max(INTERNAL_LINK_TARGET_MAX_PRODUCT_LIMIT)
    .optional()
    .default(INTERNAL_LINK_TARGET_DEFAULT_PRODUCT_LIMIT),
  selectedUrl: z.string().trim().max(255).optional(),
});

export type SearchInternalLinkTargetsQuery = z.infer<typeof searchInternalLinkTargetsQuerySchema>;

export const searchInternalLinkTargetsResponseSchema = z.object({
  items: z.array(internalLinkTargetDtoSchema),
  productLimit: z.number().int().positive(),
  requiresMinSearchLength: z.number().int().positive(),
});

export type SearchInternalLinkTargetsResponse = z.infer<
  typeof searchInternalLinkTargetsResponseSchema
>;
