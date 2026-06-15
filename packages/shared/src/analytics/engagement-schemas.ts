import { z } from 'zod';

import {
  CLICK_PLACEMENT_VALUES,
  ENGAGEMENT_EVENT_TYPE_VALUES,
  ENGAGEMENT_PLACEMENT_VALUES,
} from './placements.js';

export const clickPlacementSchema = z.enum(CLICK_PLACEMENT_VALUES);

export const engagementEventTypeSchema = z.enum(ENGAGEMENT_EVENT_TYPE_VALUES);

export const engagementPlacementSchema = z.enum(ENGAGEMENT_PLACEMENT_VALUES);

export const recordEngagementEventSchema = z.object({
  eventType: engagementEventTypeSchema,
  articleId: z.string().uuid(),
  pagePath: z.string().min(1).max(512),
  placement: engagementPlacementSchema.optional(),
  blockId: z.string().uuid().optional(),
  referrerPath: z.string().max(512).optional(),
  sessionId: z.string().max(128).optional(),
});

export type RecordEngagementEventInput = z.infer<typeof recordEngagementEventSchema>;

export const goAttributionQuerySchema = z.object({
  placement: clickPlacementSchema.optional(),
  pagePath: z.string().max(512).optional(),
  referrerPath: z.string().max(512).optional(),
  collectionId: z.string().uuid().optional(),
});

export type GoAttributionQuery = z.infer<typeof goAttributionQuerySchema>;
