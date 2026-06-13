import type { AdminProductDetail } from '@ecommerce-amazon/shared/admin';
import type { z } from 'zod';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

export type ProductFormValues = z.input<typeof createProductBodySchema>;

export function adminProductDetailToFormValues(product: AdminProductDetail): ProductFormValues {
  const visible: boolean = product.visible;
  return {
    affiliateLink: product.affiliateLink,
    marketplace: product.marketplace,
    externalId: product.externalId,
    titleClean: product.titleClean,
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    images: product.images,
    editorialScore: product.editorialScore,
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
  };
}
