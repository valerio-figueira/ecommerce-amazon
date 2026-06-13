import {
  adminProductDetailSchema,
  adminProductListResponseSchema,
  createProductResponseSchema,
  updateProductResponseSchema,
  type AdminProductDetail,
  type AdminProductListResponse,
  type CreateProductBody,
  type CreateProductResponse,
  type UpdateProductBody,
  type UpdateProductResponse,
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

export async function getAdminProduct(slug: string): Promise<AdminProductDetail> {
  return adminFetchParsed(
    `/admin/products/${encodeURIComponent(slug)}`,
    adminProductDetailSchema,
  );
}

export async function createAdminProduct(body: CreateProductBody): Promise<CreateProductResponse> {
  return adminFetchParsed('/admin/products', createProductResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateAdminProduct(
  slug: string,
  body: UpdateProductBody,
): Promise<UpdateProductResponse> {
  return adminFetchParsed(
    `/admin/products/${encodeURIComponent(slug)}`,
    updateProductResponseSchema,
    { method: 'PATCH', body },
  );
}
