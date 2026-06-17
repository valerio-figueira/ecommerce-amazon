import {
  PriceAlertTriggered,
  type EmailSender,
  type EventBus,
  type PriceAlertRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { getBrandConfig } from '@ecommerce-amazon/shared/config/brand';
import { loadEnv } from '@ecommerce-amazon/shared';

export type ProcessTriggeredAlertsResult = {
  sent: number;
};

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';

export class ProcessTriggeredAlerts {
  constructor(
    private readonly alertRepository: PriceAlertRepository,
    private readonly productRepository: ProductRepository,
    private readonly emailSender: EmailSender,
    private readonly eventBus: EventBus,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(productId: string): Promise<ProcessTriggeredAlertsResult> {
    if (!(await this.gateService.isPriceAlertsEnabled())) {
      return { sent: 0 };
    }

    const product = await this.productRepository.findById(productId);
    if (!product || product.price.isStale) return { sent: 0 };

    const brand = getBrandConfig(loadEnv());
    const alerts = await this.alertRepository.findActiveForProduct(productId);
    let sent = 0;

    for (const alert of alerts) {
      if (!alert.shouldTrigger(product.price)) continue;

      const formattedPrice = product.price.amount.toFixed(2);

      await this.emailSender.send({
        to: alert.email.value,
        subject: `Alerta de preço — ${product.titleClean} | ${brand.name}`,
        html: `<p>O preço alvo foi atingido: R$ ${formattedPrice}.</p><p>Confira em <a href="${brand.url}/produtos/${product.slug}">${brand.name}</a>.</p><p><a href="${brand.url}/alertas/cancelar/${alert.confirmToken}">Cancelar este alerta</a></p><p>Dúvidas? ${brand.contactEmail}</p>`,
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
