import { z } from 'zod';

export const operatorRoleSchema = z.enum(['admin', 'editor']);
export const operatorStatusSchema = z.enum(['active', 'disabled']);

export const operatorProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  role: operatorRoleSchema,
  status: operatorStatusSchema,
  isManagedAvatar: z.boolean(),
});

export type OperatorProfile = z.infer<typeof operatorProfileSchema>;

export const updateOperatorProfileBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(250).nullable().optional(),
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
