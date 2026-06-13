import type { Price } from '../value-objects/index.js';

export class PriceDropped {
  readonly type = 'PriceDropped' as const;

  constructor(
    readonly productId: string,
    readonly previousPrice: Price,
    readonly newPrice: Price,
    readonly occurredAt: Date,
  ) {}
}

export class ProductPriceStale {
  readonly type = 'ProductPriceStale' as const;

  constructor(
    readonly productId: string,
    readonly occurredAt: Date,
  ) {}
}

export class PriceAlertTriggered {
  readonly type = 'PriceAlertTriggered' as const;

  constructor(
    readonly alertId: string,
    readonly productId: string,
    readonly email: string,
    readonly occurredAt: Date,
  ) {}
}

export type DomainEvent = PriceDropped | ProductPriceStale | PriceAlertTriggered;
