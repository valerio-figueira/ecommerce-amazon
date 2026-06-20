import { Marketplace } from '../enums/index.js';
import type {
  AmazonStaticCredentials,
  ShopeeStaticCredentials,
} from './marketplace-connectivity.js';

export type ResolvedAmazonCredentials = AmazonStaticCredentials & {
  marketplace: Marketplace.AMAZON_BR;
};

export type ResolvedShopeeCredentials = ShopeeStaticCredentials & {
  marketplace: Marketplace.SHOPEE_BR;
};

export type ResolvedMarketplaceCredentials = ResolvedAmazonCredentials | ResolvedShopeeCredentials;

export interface MarketplaceCredentialResolverPort {
  resolve(marketplace: Marketplace): Promise<ResolvedMarketplaceCredentials | null>;
}
