import { z } from 'zod';

import { productPublicDetailSchema } from '../admin/product-schemas.js';

export const comparisonPublicDetailSchema = z.object({
  shareToken: z.string(),
  editorialIntro: z.string(),
  createdAt: z.string(),
  products: z.array(productPublicDetailSchema),
});

export const createComparisonResponseSchema = z.object({
  shareToken: z.string(),
  id: z.string(),
});

export type ComparisonPublicDetail = z.infer<typeof comparisonPublicDetailSchema>;
export type CreateComparisonResponse = z.infer<typeof createComparisonResponseSchema>;
