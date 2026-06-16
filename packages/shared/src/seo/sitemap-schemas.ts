import { z } from 'zod';

export const sitemapMetaResponseSchema = z.object({
  totalEntries: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().positive(),
});

export type SitemapMetaResponse = z.infer<typeof sitemapMetaResponseSchema>;

export const sitemapEntrySchema = z.object({
  path: z.string(),
  lastModified: z.string().datetime(),
});

export const sitemapEntriesResponseSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  items: z.array(sitemapEntrySchema),
});

export type SitemapEntriesResponse = z.infer<typeof sitemapEntriesResponseSchema>;

export const sitemapEntriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50_000).optional(),
});

export type SitemapEntriesQuery = z.infer<typeof sitemapEntriesQuerySchema>;

export const sitemapMetaQuerySchema = z.object({
  pageSize: z.coerce.number().int().positive().max(50_000).optional(),
});

export type SitemapMetaQuery = z.infer<typeof sitemapMetaQuerySchema>;
