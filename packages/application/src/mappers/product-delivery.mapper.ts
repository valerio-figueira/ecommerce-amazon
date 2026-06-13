import type { Product } from '@ecommerce-amazon/domain';
import type { ProductDeliveryItem } from '@ecommerce-amazon/shared/cms';

export function toProductDeliveryItem(product: Product): ProductDeliveryItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.titleClean,
    marketplace: product.marketplace,
    goUrl: `/go/${product.slug}`,
    ...(product.images[0] !== undefined ? { imageUrl: product.images[0] } : {}),
    price: {
      amount: product.shouldShowPrice ? product.price.amount : null,
      currency: product.price.currency,
      isStale: !product.shouldShowPrice,
      shouldShowPrice: product.shouldShowPrice,
    },
    editorialScore: product.editorialScore,
  };
}
