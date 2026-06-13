import { SnapshotSource } from '../enums/index.js';
import { Price, ProductId, toProductId } from '../value-objects/index.js';

export class PriceSnapshot {
  constructor(
    readonly id: string,
    readonly productId: ProductId,
    readonly price: Price,
    readonly source: SnapshotSource,
    readonly capturedAt: Date,
  ) {}

  static create(props: {
    id: string;
    productId: string;
    amount: number;
    currency: 'BRL' | 'USD';
    source: SnapshotSource;
    capturedAt: Date;
    isStale?: boolean;
  }): PriceSnapshot {
    return new PriceSnapshot(
      props.id,
      toProductId(props.productId),
      Price.create({
        amount: props.amount,
        currency: props.currency,
        updatedAt: props.capturedAt,
        isStale: props.isStale ?? false,
      }),
      props.source,
      props.capturedAt,
    );
  }
}
