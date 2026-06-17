import { z } from 'zod';

import { apiFetchParsed } from '@/lib/api/client';

export const batchCheckoutResponseSchema = z.object({
  url: z.string(),
  itemCount: z.number(),
});

export type BatchCheckoutResponseDto = z.infer<typeof batchCheckoutResponseSchema>;

export async function checkoutBatch(
  sessionId: string,
  marketplace: string,
): Promise<BatchCheckoutResponseDto> {
  return apiFetchParsed(
    '/wishlist/checkout-batch',
    batchCheckoutResponseSchema,
    {
      method: 'POST',
      sessionId,
      body: JSON.stringify({ marketplace }),
    },
  );
}
