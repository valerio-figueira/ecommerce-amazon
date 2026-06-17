import { z } from 'zod';

import { operatorRoleSchema, operatorStatusSchema } from './profile-schemas.js';

export const operatorSummarySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: operatorRoleSchema,
  status: operatorStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OperatorSummary = z.infer<typeof operatorSummarySchema>;

export const operatorsListResponseSchema = z.object({
  items: z.array(operatorSummarySchema),
});

export const createOperatorBodySchema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
  role: operatorRoleSchema,
});

export type CreateOperatorBody = z.infer<typeof createOperatorBodySchema>;

export const updateOperatorAccessBodySchema = z.object({
  role: operatorRoleSchema.optional(),
  status: operatorStatusSchema.optional(),
});

export type UpdateOperatorAccessBody = z.infer<typeof updateOperatorAccessBodySchema>;

export const changeOperatorPasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type ChangeOperatorPasswordBody = z.infer<typeof changeOperatorPasswordBodySchema>;
