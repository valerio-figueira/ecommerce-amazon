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
  visible: boolean;
  goUrl: string;
  editorialScore: number;
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

export type AdminProductListItemDto = {
  id: string;
  slug: string;
  title: string;
  marketplace: string;
  externalId: string;
  affiliateLink: string;
  price: ProductPriceDto;
  availability: string;
  editorialScore: number;
  visible: boolean;
  imageUrl?: string | undefined;
  createdAt: string;
};

export type AdminProductListResponseDto = {
  items: AdminProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminProductDetailDto = {
  id: string;
  slug: string;
  affiliateLink: string;
  marketplace: string;
  externalId: string;
  titleClean: string;
  categoryId?: string | undefined;
  images: string[];
  editorialScore: number;
  pros: string[];
  cons: string[];
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  price: number;
  strikethroughPrice?: number | undefined;
  shouldShowPrice: boolean;
  visible: boolean;
  availability: string;
  createdAt: string;
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
    visible: product.visible,
    goUrl: `/go/${product.slug}`,
    editorialScore: product.editorialScore,
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

export function toAdminProductListItemDto(product: Product): AdminProductListItemDto {
  return {
    id: product.id,
    slug: product.slug,
    title: product.titleClean,
    marketplace: product.marketplace,
    externalId: product.externalId,
    affiliateLink: product.affiliateLink.url,
    price: toProductPriceDto(product),
    availability: product.availability,
    editorialScore: product.editorialScore,
    visible: product.visible,
    ...(product.images[0] !== undefined ? { imageUrl: product.images[0] } : {}),
    createdAt: product.createdAt.toISOString(),
  };
}

export function toAdminProductListResponseDto(
  result: {
    items: Product[];
    total: number;
    page: number;
    pageSize: number;
  },
): AdminProductListResponseDto {
  return {
    items: result.items.map(toAdminProductListItemDto),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export function toAdminProductDetailDto(product: Product): AdminProductDetailDto {
  return {
    id: product.id,
    slug: product.slug,
    affiliateLink: product.affiliateLink.url,
    marketplace: product.marketplace,
    externalId: product.externalId,
    titleClean: product.titleClean,
    images: product.images,
    editorialScore: product.editorialScore / 10,
    pros: product.pros ?? [],
    cons: product.cons ?? [],
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    ...(product.shortDescription !== undefined ? { shortDescription: product.shortDescription } : {}),
    ...(product.longDescriptionHtml !== undefined
      ? { longDescriptionHtml: product.longDescriptionHtml }
      : {}),
    ...(product.metaTitle !== undefined ? { metaTitle: product.metaTitle } : {}),
    ...(product.metaDescription !== undefined ? { metaDescription: product.metaDescription } : {}),
    price: product.price.amount,
    ...(product.strikethroughPrice !== undefined
      ? { strikethroughPrice: product.strikethroughPrice }
      : {}),
    shouldShowPrice: !product.price.isStale,
    visible: product.visible,
    availability: product.availability,
    createdAt: product.createdAt.toISOString(),
  };
}
