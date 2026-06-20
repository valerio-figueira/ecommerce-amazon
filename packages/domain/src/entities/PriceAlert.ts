import { AlertStatus } from '../enums/index.js';
import { Email, Price, ProductId, toProductId } from '../value-objects/index.js';

export class PriceAlert {
  constructor(
    readonly id: string,
    readonly productId: ProductId,
    readonly email: Email,
    readonly targetPrice: number,
    readonly status: AlertStatus,
    readonly confirmToken: string,
    readonly createdAt: Date,
    readonly triggeredAt?: Date,
  ) {}

  static create(props: {
    id: string;
    productId: string;
    email: Email;
    targetPrice: number;
    confirmToken: string;
    createdAt: Date;
  }): PriceAlert {
    return new PriceAlert(
      props.id,
      toProductId(props.productId),
      props.email,
      props.targetPrice,
      AlertStatus.PENDING,
      props.confirmToken,
      props.createdAt,
    );
  }

  activate(): PriceAlert {
    return new PriceAlert(
      this.id,
      this.productId,
      this.email,
      this.targetPrice,
      AlertStatus.ACTIVE,
      this.confirmToken,
      this.createdAt,
      this.triggeredAt,
    );
  }

  trigger(at: Date): PriceAlert {
    return new PriceAlert(
      this.id,
      this.productId,
      this.email,
      this.targetPrice,
      AlertStatus.TRIGGERED,
      this.confirmToken,
      this.createdAt,
      at,
    );
  }

  cancel(): PriceAlert {
    return new PriceAlert(
      this.id,
      this.productId,
      this.email,
      this.targetPrice,
      AlertStatus.EXPIRED,
      this.confirmToken,
      this.createdAt,
      this.triggeredAt,
    );
  }

  shouldTrigger(currentPrice: Price): boolean {
    return this.status === AlertStatus.ACTIVE && currentPrice.meetsTarget(this.targetPrice);
  }
}
