import { adminClientFetch } from './admin-client';
import {
  adminProductDetailSchema,
  adminProductListResponseSchema,
  createProductBodySchema,
  createProductResponseSchema,
  updateProductBodySchema,
  updateProductResponseSchema,
  type AdminProductDetail,
  type AdminProductListResponse,
  type CreateProductBody,
  type CreateProductResponse,
  type UpdateProductBody,
  type UpdateProductResponse,
} from '@ecommerce-amazon/shared/admin';

export type ListAdminProductsClientParams = {
  page?: number;
  pageSize?: number;
  marketplace?: string;
  search?: string;
};

export async function listAdminProductsClient(
  params: ListAdminProductsClientParams = {},
): Promise<AdminProductListResponse> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.marketplace !== undefined) search.set('marketplace', params.marketplace);
  if (params.search !== undefined && params.search.length > 0) search.set('search', params.search);

  const query = search.toString();
  const path = query.length > 0 ? `/api/admin/products?${query}` : '/api/admin/products';
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return adminProductListResponseSchema.parse(data);
}

export async function getAdminProductClient(slug: string): Promise<AdminProductDetail> {
  const response = await adminClientFetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return adminProductDetailSchema.parse(data);
}

export async function createAdminProductClient(
  body: CreateProductBody,
): Promise<CreateProductResponse> {
  const parsedBody = createProductBodySchema.parse(body);
  const response = await adminClientFetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return createProductResponseSchema.parse(data);
}

export async function updateAdminProductClient(
  slug: string,
  body: UpdateProductBody,
): Promise<UpdateProductResponse> {
  const parsedBody = updateProductBodySchema.parse(body);
  const response = await adminClientFetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  const data: unknown = await response.json();
  return updateProductResponseSchema.parse(data);
}
