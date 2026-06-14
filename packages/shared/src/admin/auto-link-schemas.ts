import { z } from 'zod';

const autoLinkTargetUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL de destino é obrigatória')
  .max(255, 'URL de destino deve ter no máximo 255 caracteres')
  .refine(
    (value) => value.startsWith('/') || value.startsWith('https://'),
    'URL de destino deve ser um caminho relativo (/) ou HTTPS',
  );

export const autoLinkKeywordSchema = z
  .string()
  .trim()
  .min(1, 'Keyword é obrigatória')
  .max(120, 'Keyword deve ter no máximo 120 caracteres');

export const adminAutoLinkSummarySchema = z.object({
  id: z.string().uuid(),
  keyword: z.string(),
  targetUrl: z.string(),
  maxMatches: z.number().int().positive(),
  priority: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminAutoLinkSummary = z.infer<typeof adminAutoLinkSummarySchema>;

export const createAutoLinkBodySchema = z.object({
  keyword: autoLinkKeywordSchema,
  targetUrl: autoLinkTargetUrlSchema,
  maxMatches: z.number().int().min(1).max(50).optional().default(1),
  priority: z.number().int().min(0).max(1000).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type CreateAutoLinkBody = z.infer<typeof createAutoLinkBodySchema>;

export const updateAutoLinkBodySchema = createAutoLinkBodySchema.partial();

export type UpdateAutoLinkBody = z.infer<typeof updateAutoLinkBodySchema>;

export const autoLinkIdParamsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const listAutoLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
});

export type ListAutoLinksQuery = z.infer<typeof listAutoLinksQuerySchema>;

export const adminAutoLinkListResponseSchema = z.object({
  items: z.array(adminAutoLinkSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type AdminAutoLinkListResponse = z.infer<typeof adminAutoLinkListResponseSchema>;

export const createAutoLinkResponseSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAutoLinkResponse = z.infer<typeof createAutoLinkResponseSchema>;
