'use client';

import { getOrCreateSessionId } from '@/lib/session';
import { getApiUrl } from '@/lib/api/client';

export async function recordClick(
  productId: string,
  origin: 'listagem' | 'detalhe' | 'embed' | 'comparador' | 'cupons' | 'coleção',
  sessionId?: string,
): Promise<void> {
  const sid = sessionId ?? getOrCreateSessionId();
  await fetch(`${getApiUrl()}/events/click`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sid,
    },
    body: JSON.stringify({ productId, origin, sessionId: sid }),
  });
}
