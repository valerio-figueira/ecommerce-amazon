import type { AdminProductDetail } from '@ecommerce-amazon/shared/admin';
import type { z } from 'zod';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

export type ProductFormValues = z.input<typeof createProductBodySchema>;

export function adminProductDetailToFormValues(product: AdminProductDetail): ProductFormValues {
  return {
    affiliateLink: product.affiliateLink,
    marketplace: product.marketplace,
    externalId: product.externalId,
    titleClean: product.titleClean,
    images: product.images,
    editorialScore: product.editorialScore,
    pros: product.pros,
    cons: product.cons,
    price: product.price,
    ...(product.strikethroughPrice !== undefined
      ? { strikethroughPrice: product.strikethroughPrice }
      : {}),
    shouldShowPrice: product.shouldShowPrice,
    availability: product.availability,
  };
}
