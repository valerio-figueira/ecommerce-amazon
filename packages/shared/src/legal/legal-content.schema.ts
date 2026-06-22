import { z } from 'zod';

export const LEGAL_SECTION_IDS = ['privacidade', 'termos', 'afiliados', 'cookies'] as const;

export type LegalSectionId = (typeof LEGAL_SECTION_IDS)[number];

export const legalSubsectionSchema = z.object({
  title: z.string().min(1).max(120),
  paragraphs: z.array(z.string().min(1)),
  listItems: z.array(z.string().min(1)).optional(),
});

export const legalSectionSchema = z.object({
  id: z.enum(LEGAL_SECTION_IDS),
  title: z.string().min(1).max(120),
  paragraphs: z.array(z.string().min(1)),
  listItems: z.array(z.string().min(1)).optional(),
  subsections: z.array(legalSubsectionSchema).optional(),
});

export const legalPageContentSchema = z.object({
  title: z.string().min(1).max(160),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  intro: z.string().min(1).max(500),
  sections: z.array(legalSectionSchema).length(4),
});

export type LegalSubsection = z.infer<typeof legalSubsectionSchema>;
export type LegalSection = z.infer<typeof legalSectionSchema>;
export type LegalPageContent = z.infer<typeof legalPageContentSchema>;

export const updateLegalInstitutionalPageBodySchema = z.object({
  content: legalPageContentSchema,
  seoTitle: z.string().max(160).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export type UpdateLegalInstitutionalPageBody = z.infer<
  typeof updateLegalInstitutionalPageBodySchema
>;

export const legalInstitutionalPageResponseSchema = z.object({
  layout: z.object({
    slug: z.string(),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    updatedAt: z.string(),
  }),
  content: legalPageContentSchema,
});

export type LegalInstitutionalPageResponse = z.infer<typeof legalInstitutionalPageResponseSchema>;

export const adminLegalInstitutionalPageResponseSchema =
  legalInstitutionalPageResponseSchema.extend({
    status: z.enum(['draft', 'published']),
    pageKind: z.enum(['block_layout', 'institutional']),
  });

export type AdminLegalInstitutionalPageResponse = z.infer<
  typeof adminLegalInstitutionalPageResponseSchema
>;
