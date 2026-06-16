import { z } from 'zod';

import { operatorSocialLinksSchema } from '../about/about-content.schema.js';

export const operatorRoleSchema = z.enum(['admin', 'editor']);
export const operatorStatusSchema = z.enum(['active', 'disabled']);
export const teamPublicRoleSchema = z.enum(['founder', 'member']);

export const operatorProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  role: operatorRoleSchema,
  status: operatorStatusSchema,
  isManagedAvatar: z.boolean(),
  jobTitle: z.string().nullable(),
  socialLinks: operatorSocialLinksSchema.nullable(),
  showOnTeam: z.boolean(),
  teamSortOrder: z.number().int().nullable(),
  publicTeamRole: teamPublicRoleSchema,
});

export type OperatorProfile = z.infer<typeof operatorProfileSchema>;

export const updateOperatorProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(250).nullable().optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  socialLinks: operatorSocialLinksSchema.nullable().optional(),
  showOnTeam: z.boolean().optional(),
  teamSortOrder: z.number().int().min(0).max(32767).nullable().optional(),
  publicTeamRole: teamPublicRoleSchema.optional(),
});

export type UpdateOperatorProfileBody = z.infer<typeof updateOperatorProfileBodySchema>;

export const updateOperatorProfileResponseSchema = z.object({
  operator: operatorProfileSchema,
  token: z.string().min(1),
});

export type UpdateOperatorProfileResponse = z.infer<typeof updateOperatorProfileResponseSchema>;

export const uploadAvatarResponseSchema = z.object({
  avatarUrl: z.string().url(),
  isManagedAvatar: z.literal(true),
});

export type UploadAvatarResponse = z.infer<typeof uploadAvatarResponseSchema>;

export const removeAvatarResponseSchema = z.object({
  avatarUrl: z.null(),
  isManagedAvatar: z.literal(false),
});

export type RemoveAvatarResponse = z.infer<typeof removeAvatarResponseSchema>;
