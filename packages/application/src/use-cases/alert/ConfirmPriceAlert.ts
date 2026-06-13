import { ValidationError, type PriceAlertRepository } from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export class ConfirmPriceAlert {
  constructor(private readonly alertRepository: PriceAlertRepository) {}

  async execute(token: string): Promise<Result<void, ValidationError>> {
    const alert = await this.alertRepository.findByConfirmToken(token);
    if (!alert) {
      return err(new ValidationError('Invalid confirmation token'));
    }
    await this.alertRepository.save(alert.activate());
    return ok(undefined);
  }
}
