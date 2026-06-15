import { z } from 'zod';

export const uploadAdminImageResponseSchema = z.object({
  url: z.string().url(),
});

export type UploadAdminImageResponse = z.infer<typeof uploadAdminImageResponseSchema>;
