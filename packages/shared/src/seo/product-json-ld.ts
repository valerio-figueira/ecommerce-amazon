import { resolveProductCanonicalUrl } from './product-canonical.js';

export type ProductJsonLdInput = {
  slug: string;
  titleClean: string;
  titleRaw: string;
  externalId: string;
  id: string;
  marketplace: string;
  images: string[];
  metaDescription?: string | undefined;
  availability: string;
  shouldShowPrice: boolean;
  price?: {
    amount: number;
    currency: string;
  } | undefined;
  siteBaseUrl: string;
  canonicalUrl?: string | null | undefined;
};

function marketplaceBrandName(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

function schemaAvailability(availability: string): string {
  return availability === 'in_stock'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

export function buildProductJsonLd(product: ProductJsonLdInput): Record<string, unknown> {
  const description = product.metaDescription ?? product.titleRaw;

  const pageUrl = resolveProductCanonicalUrl(
    product.slug,
    product.siteBaseUrl,
    product.canonicalUrl,
  );

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.titleClean,
    description,
    sku: product.externalId,
    mpn: product.id,
    url: pageUrl,
    brand: {
      '@type': 'Brand',
      name: marketplaceBrandName(product.marketplace),
    },
  };

  if (product.images[0] !== undefined) {
    base['image'] = product.images[0];
  }

  if (product.shouldShowPrice && product.price !== undefined) {
    base['offers'] = {
      '@type': 'Offer',
      url: `${product.siteBaseUrl}/go/${product.slug}`,
      priceCurrency: product.price.currency,
      price: product.price.amount,
      itemCondition: 'https://schema.org/NewCondition',
      availability: schemaAvailability(product.availability),
    };
  }

  return base;
}
