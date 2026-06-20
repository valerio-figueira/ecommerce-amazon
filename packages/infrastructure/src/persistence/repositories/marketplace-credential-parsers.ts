import type {
  MarketplaceCredentialAuthType,
  MarketplaceCredentialHealthStatus,
} from '@ecommerce-amazon/domain';

export function parseMarketplaceCredentialAuthType(value: string): MarketplaceCredentialAuthType {
  if (value === 'static_keys' || value === 'oauth') {
    return value;
  }
  throw new Error(`Invalid marketplace credential auth type: ${value}`);
}

export function parseMarketplaceCredentialHealthStatus(
  value: string,
): MarketplaceCredentialHealthStatus {
  if (value === 'not_configured' || value === 'connected' || value === 'error') {
    return value;
  }
  throw new Error(`Invalid marketplace credential health status: ${value}`);
}
