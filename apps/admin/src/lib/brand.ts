import { loadEnv } from '@ecommerce-amazon/shared';
import { createBrandConfig, getBrandConfig } from '@ecommerce-amazon/shared/config/brand';

export function getServerBrandConfig() {
  return getBrandConfig(loadEnv());
}

export function getClientBrandConfig() {
  return createBrandConfig({
    NEXT_PUBLIC_SITE_NAME: process.env['NEXT_PUBLIC_SITE_NAME'],
    NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
  });
}
