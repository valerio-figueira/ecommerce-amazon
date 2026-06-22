import type { Product } from '@ecommerce-amazon/domain';
import type { ProductDeliveryItem } from '@ecommerce-amazon/shared/cms';

import {
  resolvePublicShouldShowPrice,
  type PublicPricePresentationOptions,
} from './product-price.mapper.js';

export function toProductDeliveryItem(
  product: Product,
  options: PublicPricePresentationOptions = {},
): ProductDeliveryItem {
  const shouldShowPrice = resolvePublicShouldShowPrice(product, options);
  const pricePayload: ProductDeliveryItem['price'] = {
    amount: shouldShowPrice ? product.price.amount : null,
    currency: product.price.currency,
    isStale: !shouldShowPrice,
    shouldShowPrice,
  };

  if (
    shouldShowPrice &&
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
