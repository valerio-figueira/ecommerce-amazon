import type { Product } from '@ecommerce-amazon/domain';

export type ProductListItemDto = {
  id: string;
  slug: string;
  title: string;
  price: ProductPriceDto;
  marketplace: string;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  imageUrl?: string | undefined;
  goUrl: string;
};

export type ProductPriceDto = {
  amount: number | null;
  currency: string;
  isStale: boolean;
  updatedAt: string;
  strikethrough?: number | undefined;
};

export type ProductDetailDto = ProductListItemDto & {
  titleRaw: string;
  externalId: string;
  availability: string;
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  images: string[];
  specs: Record<string, string>;
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
};

export function toProductPriceDto(product: Product): ProductPriceDto {
  return {
    amount: product.shouldShowPrice ? product.price.amount : null,
    currency: product.price.currency,
    isStale: !product.shouldShowPrice,
    updatedAt: product.price.updatedAt.toISOString(),
    ...(product.shouldShowPrice && product.strikethroughPrice !== undefined
      ? { strikethrough: product.strikethroughPrice }
      : {}),
  };
}

export function toProductListItemDto(product: Product): ProductListItemDto {
  return {
    id: product.id,
    slug: product.slug,
    title: product.titleClean,
    price: toProductPriceDto(product),
    marketplace: product.marketplace,
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.reviewCount !== undefined ? { reviewCount: product.reviewCount } : {}),
    ...(product.images[0] !== undefined ? { imageUrl: product.images[0] } : {}),
    goUrl: `/go/${product.slug}`,
  };
}

export function toProductDetailDto(product: Product): ProductDetailDto {
  return {
    ...toProductListItemDto(product),
    titleRaw: product.titleRaw,
    externalId: product.externalId,
    availability: product.availability,
    ...(product.shortDescription !== undefined
      ? { shortDescription: product.shortDescription }
      : {}),
    ...(product.longDescriptionHtml !== undefined
      ? { longDescriptionHtml: product.longDescriptionHtml }
      : {}),
    images: product.images,
    specs: product.specsNormalized,
    ...(product.pros !== undefined ? { pros: product.pros } : {}),
    ...(product.cons !== undefined ? { cons: product.cons } : {}),
    ...(product.metaTitle !== undefined ? { metaTitle: product.metaTitle } : {}),
    ...(product.metaDescription !== undefined
      ? { metaDescription: product.metaDescription }
      : {}),
    ...(product.canonicalUrl !== undefined ? { canonicalUrl: product.canonicalUrl } : {}),
  };
}
