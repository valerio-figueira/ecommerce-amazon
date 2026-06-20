import type { CuratedCollection, Product } from '@ecommerce-amazon/domain';
import type { SpecGroup } from '@ecommerce-amazon/shared/product';
import {
  filterActiveSpecGroups,
  flattenSpecGroups,
  normalizeSpecsGroups,
} from '@ecommerce-amazon/shared/product';

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
  categoryId?: string | undefined;
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
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
  specGroups: SpecGroup[];
  specs: Record<string, string>;
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  canonicalUrl?: string | undefined;
  similarProducts: ProductListItemDto[];
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
  titleRaw?: string | undefined;
  categoryId?: string | undefined;
  images: string[];
  editorialScore: number;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  tags: string[];
  pros: string[];
  cons: string[];
  shortDescription?: string | undefined;
  longDescriptionHtml?: string | undefined;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
  specsNormalized: SpecGroup[];
  price: number;
  strikethroughPrice?: number | undefined;
  shouldShowPrice: boolean;
  visible: boolean;
  availability: string;
  createdAt: string;
};

export function toProductPriceDto(product: Product): ProductPriceDto {
  const shouldShowPrice = product.shouldShowPrice;
  const updatedAt =
    product.price.updatedAt instanceof Date
      ? product.price.updatedAt.toISOString()
      : String(product.price.updatedAt);

  return {
    amount: shouldShowPrice ? product.price.amount : null,
    currency: product.price.currency,
    isStale: !shouldShowPrice,
    updatedAt,
    ...(shouldShowPrice && product.strikethroughPrice !== undefined
      ? { strikethrough: product.strikethroughPrice }
      : {}),
  };
}

export function toProductListItemDto(
  product: Product,
  category?: { id: string; slug: string; label: string } | null,
): ProductListItemDto {
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
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    ...(category ? { categorySlug: category.slug, categoryLabel: category.label } : {}),
  };
}

export async function mapProductsToListItemDtos(
  products: Product[],
  loadCategory: (categoryId: string) => Promise<{ id: string; slug: string; label: string } | null>,
): Promise<ProductListItemDto[]> {
  const categoryIds = [
    ...new Set(
      products.map((product) => product.categoryId).filter((id): id is string => id !== undefined),
    ),
  ];
  const categories = await Promise.all(categoryIds.map((id) => loadCategory(id)));
  const categoryById = new Map(
    categories
      .filter((category): category is NonNullable<typeof category> => category !== null)
      .map((category) => [category.id, category]),
  );

  return products.map((product) =>
    toProductListItemDto(
      product,
      product.categoryId ? (categoryById.get(product.categoryId) ?? null) : null,
    ),
  );
}

export function resolveProductSpecPresentation(product: Product): {
  specGroups: SpecGroup[];
  specs: Record<string, string>;
} {
  const normalized = normalizeSpecsGroups(product.specsNormalized);
  const activeGroups = filterActiveSpecGroups(normalized);
  return {
    specGroups: activeGroups,
    specs: flattenSpecGroups(activeGroups),
  };
}

export function toProductDetailDto(product: Product): ProductDetailDto {
  const { specGroups, specs } = resolveProductSpecPresentation(product);
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
    specGroups,
    specs,
    ...(product.pros !== undefined ? { pros: product.pros } : {}),
    ...(product.cons !== undefined ? { cons: product.cons } : {}),
    ...(product.metaTitle !== undefined ? { metaTitle: product.metaTitle } : {}),
    ...(product.metaDescription !== undefined ? { metaDescription: product.metaDescription } : {}),
    ...(product.canonicalUrl !== undefined ? { canonicalUrl: product.canonicalUrl } : {}),
    similarProducts: [],
  };
}

export function toProductDetailWithEmbedsDto(
  product: Product,
  similarProducts: Product[],
): ProductDetailDto {
  return {
    ...toProductDetailDto(product),
    similarProducts: similarProducts.map((product) => toProductListItemDto(product)),
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

export function toAdminProductListResponseDto(result: {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}): AdminProductListResponseDto {
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
    ...(product.titleRaw !== product.titleClean ? { titleRaw: product.titleRaw } : {}),
    images: product.images,
    editorialScore: product.editorialScore / 10,
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.reviewCount !== undefined ? { reviewCount: product.reviewCount } : {}),
    tags: product.tags,
    pros: product.pros ?? [],
    cons: product.cons ?? [],
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    ...(product.shortDescription !== undefined
      ? { shortDescription: product.shortDescription }
      : {}),
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
    specsNormalized: normalizeSpecsGroups(product.specsNormalized),
    createdAt: product.createdAt.toISOString(),
  };
}

export type CuratedCollectionDto = {
  collection: {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImageUrl: string;
    campaignOrigin: string;
    utmDefaults: Record<string, string>;
    ctaText: string;
    updatedAt: string;
  };
  products: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export function toCuratedCollectionDto(
  collection: CuratedCollection,
  products: ProductListItemDto[],
  pagination: { total: number; page: number; pageSize: number },
): CuratedCollectionDto {
  const updatedAt =
    collection.updatedAt instanceof Date
      ? collection.updatedAt.toISOString()
      : String(collection.updatedAt);

  return {
    collection: {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      coverImageUrl: collection.coverImageUrl,
      campaignOrigin: collection.campaignOrigin,
      utmDefaults: collection.utmDefaults,
      ctaText: collection.ctaText,
      updatedAt,
    },
    products,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}
