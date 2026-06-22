import {
  AffiliateAccountStatus,
  EntityNotFoundError,
  ValidationError,
  type AffiliateAccountRepository,
  type AffiliateLinkBuilder,
  type AffiliateTrackingParams,
  type AutoLinkRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';
import {
  detectMarketplaceFromAffiliateUrl,
  isExternalAutoLinkTargetUrl,
} from '@ecommerce-amazon/shared/seo';

export class ResolveAutoLinkRedirect {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly affiliateLinkBuilder: AffiliateLinkBuilder,
  ) {}

  async execute(input: {
    id: string;
    sessionId?: string | undefined;
    origin?: string | undefined;
    articleId?: string | undefined;
    placement?: string | undefined;
    pagePath?: string | undefined;
    referrerPath?: string | undefined;
    utmSource?: string | undefined;
    utmMedium?: string | undefined;
    utmCampaign?: string | undefined;
  }): Promise<Result<{ targetUrl: string }, EntityNotFoundError | ValidationError>> {
    const autoLink = await this.autoLinkRepository.findById(input.id);
    if (!autoLink || !autoLink.isActive) {
      return err(new EntityNotFoundError('AutoLink', input.id));
    }

    if (!isExternalAutoLinkTargetUrl(autoLink.targetUrl)) {
      return err(new ValidationError('Auto-link target is not an external affiliate URL'));
    }

    const marketplace = detectMarketplaceFromAffiliateUrl(autoLink.targetUrl);
    if (marketplace) {
      const account = await this.affiliateAccountRepository.findByMarketplace(marketplace);
      if (account !== null && account.status === AffiliateAccountStatus.PENDING) {
        return err(new ValidationError('Affiliate account pending manual validation'));
      }
      if (account !== null && account.status === AffiliateAccountStatus.SUSPENDED) {
        return err(new ValidationError('Affiliate account suspended'));
      }
    }

    const tracking: AffiliateTrackingParams = {
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      ...(input.origin !== undefined ? { origin: input.origin } : {}),
      ...(input.articleId !== undefined ? { articleId: input.articleId } : {}),
      ...(input.placement !== undefined ? { placement: input.placement } : {}),
      ...(input.pagePath !== undefined ? { pagePath: input.pagePath } : {}),
      ...(input.referrerPath !== undefined ? { referrerPath: input.referrerPath } : {}),
      ...(input.utmSource !== undefined ? { utmSource: input.utmSource } : {}),
      ...(input.utmMedium !== undefined ? { utmMedium: input.utmMedium } : {}),
      ...(input.utmCampaign !== undefined ? { utmCampaign: input.utmCampaign } : {}),
    };

    const targetUrl =
      marketplace !== null
        ? this.affiliateLinkBuilder.appendTrackingToStoredUrl(
            autoLink.targetUrl,
            marketplace,
            tracking,
          )
        : autoLink.targetUrl;

    return ok({ targetUrl });
  }
}
