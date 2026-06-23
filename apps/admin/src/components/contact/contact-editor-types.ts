import { z } from 'zod';

import { contactPageContentSchema } from '@ecommerce-amazon/shared/contact';

const contactSocialLinksEditorSchema = z.object({
  linkedin: z.string().trim().url('URL inválida.').or(z.literal('')),
  instagram: z.string().trim().url('URL inválida.').or(z.literal('')),
  x: z.string().trim().url('URL inválida.').or(z.literal('')),
  telegram: z.string().trim().url('URL inválida.').or(z.literal('')),
});

const contactPageEditorContentSchema = contactPageContentSchema.omit({ socialLinks: true }).extend({
  socialLinks: contactSocialLinksEditorSchema,
});

export const contactPageEditorFormSchema = z.object({
  seoTitle: z.string().max(160),
  seoDescription: z.string().max(320),
  content: contactPageEditorContentSchema,
});

export type ContactPageEditorFormValues = z.infer<typeof contactPageEditorFormSchema>;
