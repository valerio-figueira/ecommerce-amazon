import type { Product } from '@ecommerce-amazon/domain';
import type { ProductDeliveryItem } from '@ecommerce-amazon/shared/cms';

export function toProductDeliveryItem(product: Product): ProductDeliveryItem {
  const pricePayload: ProductDeliveryItem['price'] = {
    amount: product.shouldShowPrice ? product.price.amount : null,
    currency: product.price.currency,
    isStale: !product.shouldShowPrice,
    shouldShowPrice: product.shouldShowPrice,
  };

  if (
    product.shouldShowPrice &&
    product.strikethroughPrice !== undefined &&
    product.strikethroughPrice > product.price.amount
  ) {
    pricePayload.strikethrough = product.strikethroughPrice;
  }

  return {
    id: product.id,
    slug: product.slug,
    title: product.titleClean,
    marketplace: product.marketplace,
    goUrl: `/go/${product.slug}`,
    ...(product.images[0] !== undefined ? { imageUrl: product.images[0] } : {}),
    price: pricePayload,
    editorialScore: product.editorialScore,
  };
}
