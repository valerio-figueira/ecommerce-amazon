import {
  createBrandConfig,
  getBrandConfig,
  normalizeBrandEnvValue,
} from '@ecommerce-amazon/shared/config/brand';

export function getServerBrandConfig() {
  return getBrandConfig();
}

export function getClientBrandConfig() {
  return createBrandConfig({
    SITE_NAME: normalizeBrandEnvValue(process.env['SITE_NAME']),
    NEXT_PUBLIC_SITE_NAME: normalizeBrandEnvValue(process.env['NEXT_PUBLIC_SITE_NAME']),
    NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
  });
}
