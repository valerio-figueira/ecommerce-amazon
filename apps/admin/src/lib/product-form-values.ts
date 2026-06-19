import type { AdminProductDetail } from '@ecommerce-amazon/shared/admin';
import type { z } from 'zod';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

export type ProductFormCascadeFields = {
  categoryCascadeLevel1?: string;
  categoryCascadeLevel2?: string;
  categoryCascadeLevel3?: string;
  categoryCascadeLevel4?: string;
};

export type ProductFormValues = z.input<typeof createProductBodySchema> & ProductFormCascadeFields;

export function adminProductDetailToFormValues(product: AdminProductDetail): ProductFormValues {
  const visible: boolean = product.visible;
  return {
    affiliateLink: product.affiliateLink,
    marketplace: product.marketplace,
    externalId: product.externalId,
    titleClean: product.titleClean,
    titleRaw: product.titleRaw ?? '',
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    images: product.images,
    editorialScore: product.editorialScore,
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.reviewCount !== undefined ? { reviewCount: product.reviewCount } : {}),
    tags: product.tags,
    pros: product.pros,
    cons: product.cons,
    shortDescription: product.shortDescription ?? '',
    longDescriptionHtml: product.longDescriptionHtml ?? '',
    metaTitle: product.metaTitle ?? '',
    metaDescription: product.metaDescription ?? '',
    price: product.price,
    ...(product.strikethroughPrice !== undefined
      ? { strikethroughPrice: product.strikethroughPrice }
      : {}),
    shouldShowPrice: product.shouldShowPrice,
    visible,
    availability: product.availability,
    specsNormalized: product.specsNormalized ?? [],
  };
}
