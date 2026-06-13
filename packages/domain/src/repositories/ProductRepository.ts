import type { Product } from '../entities/Product.js';
import type { Marketplace } from '../enums/index.js';
import type { RefreshCriteria } from '../services/index.js';
import type { Slug } from '../value-objects/index.js';

export type ProductListFilters = {
  page?: number;
  pageSize?: number;
  category?: string;
  marketplace?: Marketplace;
};

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: Slug | string): Promise<Product | null>;
  findByExternalId(marketplace: Marketplace, externalId: string): Promise<Product | null>;
  findPublished(filters: ProductListFilters): Promise<{ items: Product[]; total: number }>;
  findByIds(ids: string[]): Promise<Product[]>;
  findDueForPriceRefresh(criteria: RefreshCriteria): Promise<Product[]>;
  findDueForCatalogSync(criteria: RefreshCriteria): Promise<Product[]>;
  save(product: Product): Promise<void>;
  saveBatch(products: Product[]): Promise<void>;
}
