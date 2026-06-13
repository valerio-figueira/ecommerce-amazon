import { randomUUID } from 'node:crypto';

import {
  Email,
  PriceAlert,
  ValidationError,
  type PriceAlertRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export class CreatePriceAlert {
  constructor(
    private readonly alertRepository: PriceAlertRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: {
    email: string;
    productId: string;
    targetPrice: number;
    confirmToken: string;
  }): Promise<Result<{ id: string }, ValidationError>> {
    const email = Email.create(input.email);
    const count = await this.alertRepository.countActiveByEmail(email.value);
    if (count >= 10) {
      return err(new ValidationError('Maximum 10 active alerts per email'));
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return err(new ValidationError('Product not found'));
    }
    if (product.price.isStale) {
      return err(new ValidationError('Cannot create alert for stale price product'));
    }

    const alert = PriceAlert.create({
      id: randomUUID(),
      productId: input.productId,
      email,
      targetPrice: input.targetPrice,
      confirmToken: input.confirmToken,
      createdAt: new Date(),
    });

    await this.alertRepository.save(alert);
    return ok({ id: alert.id });
  }
}
