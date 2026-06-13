import {
  PriceAlertTriggered,
  type EmailSender,
  type EventBus,
  type PriceAlertRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export type ProcessTriggeredAlertsResult = {
  sent: number;
};

export class ProcessTriggeredAlerts {
  constructor(
    private readonly alertRepository: PriceAlertRepository,
    private readonly productRepository: ProductRepository,
    private readonly emailSender: EmailSender,
    private readonly eventBus: EventBus,
  ) {}

  async execute(productId: string): Promise<ProcessTriggeredAlertsResult> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.price.isStale) return { sent: 0 };

    const alerts = await this.alertRepository.findActiveForProduct(productId);
    let sent = 0;

    for (const alert of alerts) {
      if (!alert.shouldTrigger(product.price)) continue;

      await this.emailSender.send({
        to: alert.email.value,
        subject: `Price alert: ${product.titleClean}`,
        html: `<p>Target price reached: R$ ${product.price.amount.toFixed(2)}</p>`,
      });

      const triggered = alert.trigger(new Date());
      await this.alertRepository.updateStatus(triggered.id, triggered.status, triggered.triggeredAt);

      const occurredAt = new Date();
      await this.eventBus.publish(
        new PriceAlertTriggered(alert.id, productId, alert.email.value, occurredAt),
      );
      sent++;
    }

    return { sent };
  }
}
