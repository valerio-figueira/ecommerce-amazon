import type { DomainEvent, PriceDropped } from './index.js';

export type PriceDroppedMessage = {
  readonly type: 'PriceDropped';
  readonly productId: string;
  readonly occurredAt: string;
};

export type ProductPriceStaleMessage = {
  readonly type: 'ProductPriceStale';
  readonly productId: string;
  readonly occurredAt: string;
};

export type PriceAlertTriggeredMessage = {
  readonly type: 'PriceAlertTriggered';
  readonly alertId: string;
  readonly productId: string;
  readonly email: string;
  readonly occurredAt: string;
};

export type DomainEventMessage =
  | PriceDroppedMessage
  | ProductPriceStaleMessage
  | PriceAlertTriggeredMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function toDomainEventMessage(event: DomainEvent): DomainEventMessage {
  switch (event.type) {
    case 'PriceDropped':
      return {
        type: event.type,
        productId: event.productId,
        occurredAt: event.occurredAt.toISOString(),
      };
    case 'ProductPriceStale':
      return {
        type: event.type,
        productId: event.productId,
        occurredAt: event.occurredAt.toISOString(),
      };
    case 'PriceAlertTriggered':
      return {
        type: event.type,
        alertId: event.alertId,
        productId: event.productId,
        email: event.email,
        occurredAt: event.occurredAt.toISOString(),
      };
  }
}

export function isPriceDroppedMessage(value: unknown): value is PriceDroppedMessage {
  return (
    isRecord(value) &&
    value['type'] === 'PriceDropped' &&
    typeof value['productId'] === 'string' &&
    typeof value['occurredAt'] === 'string'
  );
}

export function isDomainEventMessage(value: unknown): value is DomainEventMessage {
  return (
    isPriceDroppedMessage(value) ||
    (isRecord(value) &&
      value['type'] === 'ProductPriceStale' &&
      typeof value['productId'] === 'string') ||
    (isRecord(value) &&
      value['type'] === 'PriceAlertTriggered' &&
      typeof value['alertId'] === 'string')
  );
}

export function toPriceDroppedMessage(event: PriceDropped): PriceDroppedMessage {
  return {
    type: event.type,
    productId: event.productId,
    occurredAt: event.occurredAt.toISOString(),
  };
}
