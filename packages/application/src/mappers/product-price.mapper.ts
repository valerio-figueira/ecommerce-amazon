import type { Product } from '@ecommerce-amazon/domain';

export type PublicPricePresentationOptions = {
  pricesEnabled?: boolean;
};

export function resolvePublicShouldShowPrice(
  product: Product,
  options: PublicPricePresentationOptions = {},
): boolean {
  const pricesEnabled = options.pricesEnabled ?? true;
  return pricesEnabled && product.shouldShowPrice;
}
