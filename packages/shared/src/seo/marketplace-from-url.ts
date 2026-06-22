import { Marketplace } from '@ecommerce-amazon/domain';

export function detectMarketplaceFromAffiliateUrl(url: string): Marketplace | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('amazon.') || hostname === 'amzn.to') {
      return Marketplace.AMAZON_BR;
    }
    if (hostname.includes('shopee.')) {
      return Marketplace.SHOPEE_BR;
    }
    if (
      hostname.includes('mercadolivre.') ||
      hostname === 'meli.la' ||
      hostname.includes('mercadolibre.')
    ) {
      return Marketplace.MERCADOLIVRE_BR;
    }
    return null;
  } catch {
    return null;
  }
}
