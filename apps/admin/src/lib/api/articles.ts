import { z } from 'zod';

import { adminFetchParsed } from './admin-fetch';

const adminArticleSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
});

const adminArticlesResponseSchema = z.object({
  items: z.array(adminArticleSummarySchema),
});

export type AdminArticleSummary = z.infer<typeof adminArticleSummarySchema>;

export async function listAdminArticles(): Promise<AdminArticleSummary[]> {
  const response = await adminFetchParsed('/admin/articles', adminArticlesResponseSchema);
  return response.items;
}
