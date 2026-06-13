import type { DomainEvent } from '../events/index.js';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
}
