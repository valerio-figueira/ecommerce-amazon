import { loadEnv } from '@ecommerce-amazon/shared';
import { getBrandConfig } from '@ecommerce-amazon/shared/config/brand';

export function getServerBrandConfig() {
  return getBrandConfig(loadEnv());
}

export function getClientBrandConfig() {
  return getBrandConfig(process.env);
}
