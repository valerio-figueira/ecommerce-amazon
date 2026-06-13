import {
  adminProductListResponseSchema,
  createProductResponseSchema,
  type AdminProductListResponse,
  type CreateProductBody,
  type CreateProductResponse,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export type ListAdminProductsParams = {
  page?: number;
  pageSize?: number;
  marketplace?: string;
};

export async function listAdminProducts(
  params: ListAdminProductsParams = {},
): Promise<AdminProductListResponse> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.marketplace !== undefined) search.set('marketplace', params.marketplace);

  const query = search.toString();
  const path = query.length > 0 ? `/admin/products?${query}` : '/admin/products';
  return adminFetchParsed(path, adminProductListResponseSchema);
}

export async function createAdminProduct(body: CreateProductBody): Promise<CreateProductResponse> {
  return adminFetchParsed('/admin/products', createProductResponseSchema, {
    method: 'POST',
    body,
  });
}
