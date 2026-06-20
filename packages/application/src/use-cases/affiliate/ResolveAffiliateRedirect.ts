import {
  AffiliateAccountStatus,
  EntityNotFoundError,
  ValidationError,
  type AffiliateAccountRepository,
  type AffiliateLinkBuilder,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';

export class ResolveAffiliateRedirect {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly affiliateLinkBuilder: AffiliateLinkBuilder,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(input: {
    slug: string;
    blockId?: string | undefined;
    sessionId?: string | undefined;
    origin?: string | undefined;
    comparisonSlug?: string | undefined;
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
  }): Promise<
    Result<
      { productId: string; targetUrl: string; marketplace: string },
      EntityNotFoundError | ValidationError
    >
  > {
    const product = await this.productRepository.findBySlug(input.slug);
    if (!product) {
      return err(new EntityNotFoundError('Product', input.slug));
    }

    const account = await this.affiliateAccountRepository.findByMarketplace(product.marketplace);

    if (account !== null && account.status === AffiliateAccountStatus.PENDING) {
      return err(new ValidationError('Affiliate account pending manual validation'));
    }

    if (account !== null && account.status === AffiliateAccountStatus.SUSPENDED) {
      return err(new ValidationError('Affiliate account suspended'));
    }

    const affiliateTag = account?.affiliateTag;
    const targetUrl = this.affiliateLinkBuilder.buildWithTracking(
      product.marketplace,
      product.externalId,
      {
        ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
        ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
        ...(input.origin !== undefined ? { origin: input.origin } : {}),
        ...(input.comparisonSlug !== undefined ? { comparisonSlug: input.comparisonSlug } : {}),
        ...(input.utmSource !== undefined ? { utmSource: input.utmSource } : {}),
        ...(input.utmMedium !== undefined ? { utmMedium: input.utmMedium } : {}),
        ...(input.utmCampaign !== undefined ? { utmCampaign: input.utmCampaign } : {}),
      },
      affiliateTag,
    );

    return ok({
      productId: product.id,
      targetUrl,
      marketplace: product.marketplace,
    });
  }
}
