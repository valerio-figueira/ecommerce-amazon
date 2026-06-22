import { z } from 'zod';

import { legalPageContentSchema } from '@ecommerce-amazon/shared/legal';

export const legalPageEditorFormSchema = z.object({
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  content: legalPageContentSchema,
});

export type LegalPageEditorFormValues = z.infer<typeof legalPageEditorFormSchema>;
