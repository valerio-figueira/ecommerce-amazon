import { Queue } from 'bullmq';

import type { DomainEvent, EventBus } from '@ecommerce-amazon/domain';
import { toDomainEventMessage, type DomainEventMessage } from '@ecommerce-amazon/domain';
import type { Marketplace } from '@ecommerce-amazon/domain';

import type { RedisConnectionOptions } from '../cache/redis-connection.js';

export const QUEUE_NAMES = {
  CATALOG_SYNC: 'catalog_sync',
  PRICE_REFRESH: 'price_refresh',
  HYGIENE: 'hygiene',
  COUPON_VERIFY: 'coupon_verify',
  DOMAIN_EVENTS: 'domain_events',
  EMAIL_DELIVERY: 'email_delivery',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export type MarketplaceJobData = {
  marketplace: Marketplace;
  externalIds: string[];
};

export type SchedulerTriggerJobData = {
  trigger: 'schedule';
};

export type PriceRefreshJobData = MarketplaceJobData | SchedulerTriggerJobData;
export type CatalogSyncJobData = MarketplaceJobData | SchedulerTriggerJobData;

export type EmailDeliveryJobData = {
  to: string;
  subject: string;
  html: string;
};

export function createQueue<TData>(
  name: QueueName,
  connection: RedisConnectionOptions,
): Queue<TData> {
  return new Queue<TData>(name, {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  });
}

export class BullMQEventBus implements EventBus {
  constructor(private readonly domainEventsQueue: Queue<DomainEventMessage>) {}

  async publish(event: DomainEvent): Promise<void> {
    const message = toDomainEventMessage(event);
    await this.domainEventsQueue.add(message.type, message);
  }
}
