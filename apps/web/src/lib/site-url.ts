import { getBrandConfig } from '@ecommerce-amazon/shared/config/brand';

export function getSiteBaseUrl(): string {
  return getBrandConfig().url;
}

export function getServerBrandConfig() {
  return getBrandConfig();
}
