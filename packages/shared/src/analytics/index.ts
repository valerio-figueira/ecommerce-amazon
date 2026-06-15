export {
  ClickPlacement,
  CLICK_PLACEMENT_VALUES,
  EngagementEventType,
  ENGAGEMENT_EVENT_TYPE_VALUES,
  ENGAGEMENT_PLACEMENT_VALUES,
  type ClickPlacementValue,
  type EngagementEventTypeValue,
  type EngagementPlacementValue,
} from './placements.js';

export {
  clickPlacementSchema,
  engagementEventTypeSchema,
  engagementPlacementSchema,
  goAttributionQuerySchema,
  recordEngagementEventSchema,
  type GoAttributionQuery,
  type RecordEngagementEventInput,
} from './engagement-schemas.js';

export type {
  ClickEventPayload,
  EngagementEventPayload,
  PendingTelemetryAggregates,
} from './telemetry-payloads.js';
