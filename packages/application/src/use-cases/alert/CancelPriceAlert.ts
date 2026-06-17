import { AlertStatus, ValidationError, type PriceAlertRepository } from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export class CancelPriceAlert {
  constructor(private readonly alertRepository: PriceAlertRepository) {}

  async execute(token: string): Promise<Result<void, ValidationError>> {
    const alert = await this.alertRepository.findByConfirmToken(token);
    if (!alert) {
      return err(new ValidationError('Invalid cancellation token'));
    }

    if (
      alert.status === AlertStatus.EXPIRED ||
      alert.status === AlertStatus.TRIGGERED
    ) {
      return ok(undefined);
    }

    await this.alertRepository.save(alert.cancel());
    return ok(undefined);
  }
}
