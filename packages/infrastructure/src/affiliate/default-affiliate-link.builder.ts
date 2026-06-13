import { Marketplace, type AffiliateLinkBuilder } from '@ecommerce-amazon/domain';

export class DefaultAffiliateLinkBuilder implements AffiliateLinkBuilder {
  constructor(
    private readonly amazonTag: string,
    private readonly shopeeAffiliateId: string,
  ) {}

  build(marketplace: Marketplace, externalId: string): string {
    if (marketplace === Marketplace.AMAZON_BR) {
      return `https://www.amazon.com.br/dp/${externalId}?tag=${this.amazonTag}`;
    }
    return `https://shopee.com.br/product/${externalId}?affiliate_id=${this.shopeeAffiliateId}`;
  }

  buildBatchCheckout(marketplace: Marketplace, externalIds: string[]): string {
    if (marketplace === Marketplace.AMAZON_BR) {
      const items = externalIds.map((id) => `ASIN.1=${id}.Quantity.1=1`).join('&');
      return `https://www.amazon.com.br/gp/aws/cart/add.html?${items}&tag=${this.amazonTag}`;
    }
    return externalIds.map((id) => this.build(marketplace, id)).join('|');
  }
}
