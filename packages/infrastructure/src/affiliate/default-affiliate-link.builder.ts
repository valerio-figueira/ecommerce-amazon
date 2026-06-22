import {
  Marketplace,
  type AffiliateLinkBuilder,
  type AffiliateTrackingParams,
} from '@ecommerce-amazon/domain';

export class DefaultAffiliateLinkBuilder implements AffiliateLinkBuilder {
  constructor(
    private readonly amazonTag: string,
    private readonly shopeeAffiliateId: string,
    private readonly mercadoLivreAffiliateTag: string = '',
  ) {}

  build(marketplace: Marketplace, externalId: string): string {
    return this.buildWithTracking(marketplace, externalId, {});
  }

  buildWithTracking(
    marketplace: Marketplace,
    externalId: string,
    tracking: AffiliateTrackingParams,
    affiliateTag?: string,
  ): string {
    const subTag = this.composeSubTag(tracking);

    if (marketplace === Marketplace.AMAZON_BR) {
      const tag = affiliateTag ?? this.amazonTag;
      const url = new URL(`https://www.amazon.com.br/dp/${externalId}`);
      url.searchParams.set('tag', tag);
      if (subTag) {
        url.searchParams.set('ascsubtag', subTag);
      }
      this.applyUtmParams(url, tracking);
      return url.toString();
    }

    if (marketplace === Marketplace.SHOPEE_BR) {
      const shopeeId = affiliateTag ?? this.shopeeAffiliateId;
      const url = new URL(`https://shopee.com.br/product/${externalId}`);
      url.searchParams.set('affiliate_id', shopeeId);
      if (tracking.origin) {
        url.searchParams.set('utm_source', tracking.origin);
      }
      const subId = tracking.comparisonSlug ?? tracking.blockId;
      if (subId) {
        url.searchParams.set('sub_id', subId.slice(0, 50));
      }
      if (tracking.sessionId) {
        url.searchParams.set('utm_content', tracking.sessionId);
      }
      this.applyUtmParams(url, tracking);
      return url.toString();
    }

    const mlId = externalId.replace(/^MLB-?/i, 'MLB');
    const url = new URL(`https://produto.mercadolivre.com.br/${mlId}`);
    const mlTag = affiliateTag ?? this.mercadoLivreAffiliateTag;
    if (mlTag) {
      url.searchParams.set('matt_tool', mlTag);
    }
    if (tracking.origin) {
      url.searchParams.set('utm_source', tracking.origin);
    }
    if (tracking.comparisonSlug) {
      url.searchParams.set('utm_campaign', tracking.comparisonSlug.slice(0, 50));
    }
    this.applyUtmParams(url, tracking);
    return url.toString();
  }

  appendTrackingToStoredUrl(
    affiliateUrl: string,
    marketplace: Marketplace,
    tracking: AffiliateTrackingParams,
  ): string {
    const url = new URL(affiliateUrl);

    if (marketplace === Marketplace.MERCADOLIVRE_BR) {
      if (tracking.origin) {
        url.searchParams.set('utm_source', tracking.origin);
      }
      if (tracking.comparisonSlug) {
        url.searchParams.set('utm_campaign', tracking.comparisonSlug.slice(0, 50));
      }
    } else if (marketplace === Marketplace.AMAZON_BR) {
      const subTag = this.composeSubTag(tracking);
      if (subTag) {
        url.searchParams.set('ascsubtag', subTag);
      }
    } else if (marketplace === Marketplace.SHOPEE_BR) {
      if (tracking.origin) {
        url.searchParams.set('utm_source', tracking.origin);
      }
      const subId = tracking.comparisonSlug ?? tracking.blockId;
      if (subId) {
        url.searchParams.set('sub_id', subId.slice(0, 50));
      }
      if (tracking.sessionId) {
        url.searchParams.set('utm_content', tracking.sessionId);
      }
    }

    this.applyUtmParams(url, tracking);
    return url.toString();
  }

  private applyUtmParams(url: URL, tracking: AffiliateTrackingParams): void {
    if (tracking.utmSource) {
      url.searchParams.set('utm_source', tracking.utmSource);
    }
    if (tracking.utmMedium) {
      url.searchParams.set('utm_medium', tracking.utmMedium);
    }
    if (tracking.utmCampaign) {
      url.searchParams.set('utm_campaign', tracking.utmCampaign);
    }
  }

  buildBatchCheckout(marketplace: Marketplace, externalIds: string[]): string {
    if (marketplace === Marketplace.AMAZON_BR) {
      const items = externalIds.map((id) => `ASIN.1=${id}.Quantity.1=1`).join('&');
      return `https://www.amazon.com.br/gp/aws/cart/add.html?${items}&tag=${this.amazonTag}`;
    }
    return externalIds.map((id) => this.build(marketplace, id)).join('|');
  }

  private composeSubTag(tracking: AffiliateTrackingParams): string | undefined {
    const comparisonSegment = tracking.comparisonSlug
      ? `cmp_${tracking.comparisonSlug.slice(0, 50)}`
      : undefined;
    const parts = [comparisonSegment, tracking.blockId, tracking.sessionId, tracking.origin].filter(
      (part): part is string => part !== undefined && part.length > 0,
    );
    return parts.length > 0 ? parts.join('_') : undefined;
  }
}
