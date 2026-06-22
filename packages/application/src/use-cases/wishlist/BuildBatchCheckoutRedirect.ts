import {
  AffiliateAccountStatus,
  Marketplace,
  ValidationError,
  type AffiliateAccountRepository,
  type AffiliateLinkBuilder,
  type ProductRepository,
  type WishlistRepository,
} from '@ecommerce-amazon/domain';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';

export class BuildBatchCheckoutRedirect {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly linkBuilder: AffiliateLinkBuilder,
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(input: { sessionId: string; marketplace: Marketplace }) {
    if (!(await this.gateService.isBatchCheckoutEnabled())) {
      throw new ValidationError('Batch checkout is disabled by platform settings');
    }

    const account = await this.affiliateAccountRepository.findByMarketplace(input.marketplace);

    if (account !== null && account.status === AffiliateAccountStatus.PENDING) {
      throw new ValidationError('Affiliate account pending manual validation');
    }

    if (account !== null && account.status === AffiliateAccountStatus.SUSPENDED) {
      throw new ValidationError('Affiliate account suspended');
    }

    const items = await this.wishlistRepository.findBySessionId(input.sessionId);
    const filtered = items.filter((i) => i.marketplace === input.marketplace);

    if (filtered.length === 0) {
      throw new ValidationError('No wishlist items for this marketplace');
    }

    const products = await this.productRepository.findByIds(filtered.map((i) => i.productId));

    if (input.marketplace === Marketplace.MERCADOLIVRE_BR) {
      const url = products.map((product) => product.affiliateLink.url).join('|');
      return { url, itemCount: products.length };
    }

    const externalIds = products.map((p) => p.externalId);
    const url = this.linkBuilder.buildBatchCheckout(input.marketplace, externalIds);
    return { url, itemCount: externalIds.length };
  }
}
