import { z } from 'zod';

import { operatorSocialLinksSchema } from '../about/about-content.schema.js';

export const contactSocialLinksSchema = operatorSocialLinksSchema;

export type ContactSocialLinks = z.infer<typeof contactSocialLinksSchema>;

export const contactPageContentSchema = z.object({
  title: z.string().min(1).max(120),
  intro: z.string().min(1).max(500),
  emailLabel: z.string().min(1).max(60),
  email: z.string().email().max(120),
  socialHeading: z.string().min(1).max(80),
  socialLinks: contactSocialLinksSchema,
  socialsEnabled: z.boolean(),
  showOnHome: z.boolean(),
  legalLinkLabel: z.string().min(1).max(120),
  aboutLinkLabel: z.string().min(1).max(80),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ContactPageContent = z.infer<typeof contactPageContentSchema>;

export const updateContactInstitutionalPageBodySchema = z.object({
  content: contactPageContentSchema,
  seoTitle: z.string().max(160).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type UpdateContactInstitutionalPageBody = z.infer<
  typeof updateContactInstitutionalPageBodySchema
>;

export const contactInstitutionalPageResponseSchema = z.object({
  layout: z.object({
    slug: z.string(),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    updatedAt: z.string(),
  }),
  content: contactPageContentSchema,
});

export type ContactInstitutionalPageResponse = z.infer<
  typeof contactInstitutionalPageResponseSchema
>;

export const adminContactInstitutionalPageResponseSchema =
  contactInstitutionalPageResponseSchema.extend({
    status: z.enum(['draft', 'published']),
    pageKind: z.enum(['block_layout', 'institutional']),
  });

export type AdminContactInstitutionalPageResponse = z.infer<
  typeof adminContactInstitutionalPageResponseSchema
>;
