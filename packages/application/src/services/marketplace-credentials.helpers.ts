import {
  Marketplace,
  ValidationError,
  type AmazonStaticCredentials,
  type ResolvedAmazonCredentials,
  type ResolvedShopeeCredentials,
  type ShopeeStaticCredentials,
} from '@ecommerce-amazon/domain';
import {
  amazonStaticCredentialsBodySchema,
  shopeeStaticCredentialsBodySchema,
  type SaveAmazonCredentialsBody,
  type SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

function buildAmazonPublicMetadata(credentials: SaveAmazonCredentialsBody): Record<string, unknown> {
  return {
    accessKeyIdPrefix: credentials.accessKeyId.slice(0, 4),
    accessKeyIdLast4: credentials.accessKeyId.slice(-4),
    host: credentials.host ?? 'webservices.amazon.com.br',
    region: credentials.region ?? 'us-east-1',
    configuredAt: new Date().toISOString(),
  };
}

function buildShopeePublicMetadata(credentials: SaveShopeeCredentialsBody): Record<string, unknown> {
  return {
    partnerId: credentials.partnerId,
    partnerKeyLast4: credentials.partnerKey.slice(-4),
    configuredAt: new Date().toISOString(),
  };
}

export function buildPublicMetadata(
  marketplace: Marketplace,
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Record<string, unknown> {
  if (marketplace === Marketplace.AMAZON_BR) {
    return buildAmazonPublicMetadata(amazonStaticCredentialsBodySchema.parse(credentials));
  }
  if (marketplace === Marketplace.SHOPEE_BR) {
    return buildShopeePublicMetadata(shopeeStaticCredentialsBodySchema.parse(credentials));
  }
  throw new ValidationError(`Unsupported marketplace credentials metadata: ${marketplace}`);
}

export function normalizeAmazonStaticCredentials(
  credentials: SaveAmazonCredentialsBody,
): AmazonStaticCredentials {
  return {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    ...(credentials.host !== undefined ? { host: credentials.host } : {}),
    ...(credentials.region !== undefined ? { region: credentials.region } : {}),
  };
}

export function normalizeShopeeStaticCredentials(
  credentials: SaveShopeeCredentialsBody,
): ShopeeStaticCredentials {
  return {
    partnerId: credentials.partnerId,
    partnerKey: credentials.partnerKey,
  };
}

export function toResolvedAmazonCredentials(
  credentials: SaveAmazonCredentialsBody,
): ResolvedAmazonCredentials {
  return {
    marketplace: Marketplace.AMAZON_BR,
    ...normalizeAmazonStaticCredentials(credentials),
  };
}

export function toResolvedShopeeCredentials(
  credentials: SaveShopeeCredentialsBody,
): ResolvedShopeeCredentials {
  return {
    marketplace: Marketplace.SHOPEE_BR,
    ...normalizeShopeeStaticCredentials(credentials),
  };
}

export function toAmazonStaticCredentials(
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): AmazonStaticCredentials {
  return normalizeAmazonStaticCredentials(amazonStaticCredentialsBodySchema.parse(credentials));
}

export function toShopeeStaticCredentials(
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): ShopeeStaticCredentials {
  return normalizeShopeeStaticCredentials(shopeeStaticCredentialsBodySchema.parse(credentials));
}
