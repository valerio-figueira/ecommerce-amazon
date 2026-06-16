import { z } from 'zod';

export const ABOUT_SECTION_IDS = ['proposta', 'metodo', 'afiliados', 'equipe'] as const;

export type AboutSectionId = (typeof ABOUT_SECTION_IDS)[number];

export const aboutSectionSchema = z.object({
  id: z.enum(ABOUT_SECTION_IDS),
  title: z.string().min(1).max(120),
  paragraphs: z.array(z.string().min(1)).min(1),
  listItems: z.array(z.string()).optional(),
  callout: z.boolean().optional(),
});

export const aboutTrafficLinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z
    .string()
    .min(1)
    .max(256)
    .refine((value) => value.startsWith('/') && !value.startsWith('//'), {
      message: 'href must be an internal path',
    }),
  description: z.string().max(120).optional(),
});

export const aboutTrafficDirectionSchema = z.object({
  title: z.string().min(1).max(120),
  intro: z.string().min(1).max(300),
  links: z.array(aboutTrafficLinkSchema).min(1).max(3),
});

export const aboutPageContentSchema = z.object({
  heroTitle: z.string().min(1).max(160),
  heroIntro: z.string().min(1).max(500),
  sections: z.array(aboutSectionSchema).length(4),
  teamSectionIntro: z.string().min(1).max(500),
  trafficDirection: aboutTrafficDirectionSchema,
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type AboutSection = z.infer<typeof aboutSectionSchema>;
export type AboutTrafficLink = z.infer<typeof aboutTrafficLinkSchema>;
export type AboutTrafficDirection = z.infer<typeof aboutTrafficDirectionSchema>;
export type AboutPageContent = z.infer<typeof aboutPageContentSchema>;

export const operatorSocialLinksSchema = z.object({
  linkedin: z.string().url().optional(),
  instagram: z.string().url().optional(),
  x: z.string().url().optional(),
  telegram: z.string().url().optional(),
});

export type OperatorSocialLinksDto = z.infer<typeof operatorSocialLinksSchema>;

export const publicTeamMemberSchema = z.object({
  name: z.string(),
  jobTitle: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  socialLinks: operatorSocialLinksSchema.nullable(),
  publicTeamRole: z.enum(['founder', 'member']),
});

export type PublicTeamMemberDto = z.infer<typeof publicTeamMemberSchema>;

export const publicTeamResponseSchema = z.object({
  members: z.array(publicTeamMemberSchema),
});

export type PublicTeamResponse = z.infer<typeof publicTeamResponseSchema>;

export const institutionalPageLayoutSchema = z.object({
  slug: z.string(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const institutionalPageResponseSchema = z.object({
  layout: institutionalPageLayoutSchema,
  content: aboutPageContentSchema,
});

export type InstitutionalPageResponse = z.infer<typeof institutionalPageResponseSchema>;
