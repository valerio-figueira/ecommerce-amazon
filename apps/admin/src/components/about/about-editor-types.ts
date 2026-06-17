import { z } from 'zod';

import { aboutPageContentSchema } from '@ecommerce-amazon/shared/about';

export const aboutPageEditorFormSchema = z.object({
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  content: aboutPageContentSchema,
});

export type AboutPageEditorFormValues = z.infer<typeof aboutPageEditorFormSchema>;
