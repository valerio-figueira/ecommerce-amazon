import { buildProductJsonLd } from '@ecommerce-amazon/shared/seo';

import type { ProductDetailDto } from '@/lib/api/schemas';

type ProductJsonLdProps = {
  product: ProductDetailDto;
  siteBaseUrl: string;
};

export function ProductJsonLd({ product, siteBaseUrl }: ProductJsonLdProps): React.JSX.Element {
  const jsonLd = buildProductJsonLd({
    slug: product.slug,
    titleClean: product.title,
    titleRaw: product.titleRaw,
    externalId: product.externalId,
    id: product.id,
    marketplace: product.marketplace,
    images: product.images,
    ...(product.metaDescription !== undefined
      ? { metaDescription: product.metaDescription }
      : {}),
    availability: product.availability,
    shouldShowPrice: !product.price.isStale && product.price.amount !== null,
    ...(product.price.amount !== null && !product.price.isStale
      ? { price: { amount: product.price.amount, currency: product.price.currency } }
      : {}),
    siteBaseUrl,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
