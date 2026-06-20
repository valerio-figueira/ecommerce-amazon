import type {
  EngagementEventTypeValue,
  EngagementPlacementValue,
} from '@ecommerce-amazon/shared/analytics';

import { getApiUrl } from '@/lib/api/client';

export type RecordEngagementInput = {
  eventType: EngagementEventTypeValue;
  articleId: string;
  pagePath: string;
  placement?: EngagementPlacementValue;
  blockId?: string;
  referrerPath?: string;
  sessionId?: string;
};

export async function recordEngagement(input: RecordEngagementInput): Promise<void> {
  try {
    await fetch(`${getApiUrl()}/events/engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.sessionId ? { 'x-session-id': input.sessionId } : {}),
      },
      body: JSON.stringify({
        eventType: input.eventType,
        articleId: input.articleId,
        pagePath: input.pagePath,
        ...(input.placement !== undefined ? { placement: input.placement } : {}),
        ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
        ...(input.referrerPath !== undefined ? { referrerPath: input.referrerPath } : {}),
        ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      }),
      keepalive: true,
    });
  } catch {
    // Fire-and-forget telemetry must not block navigation.
  }
}
