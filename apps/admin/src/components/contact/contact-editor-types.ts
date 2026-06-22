import { z } from 'zod';

import { contactPageContentSchema } from '@ecommerce-amazon/shared/contact';

export const contactPageEditorFormSchema = z.object({
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  content: contactPageContentSchema,
});

export type ContactPageEditorFormValues = z.infer<typeof contactPageEditorFormSchema>;
