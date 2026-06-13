import type { ProductDeliveryItem } from '@ecommerce-amazon/shared/cms';

import type { ProductListItemDto } from '@/lib/api/types';

export function mapDeliveryProductToListItem(item: ProductDeliveryItem): ProductListItemDto {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    marketplace: item.marketplace,
    goUrl: item.goUrl,
    editorialScore: item.editorialScore,
    ...(item.imageUrl !== undefined ? { imageUrl: item.imageUrl } : {}),
    price: {
      amount: item.price.amount,
      currency: item.price.currency,
      isStale: item.price.isStale,
      updatedAt: item.price.isStale ? '' : new Date().toISOString(),
    },
  };
}
