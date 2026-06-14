import { z } from 'zod';

import { BlockType } from '@ecommerce-amazon/domain';
import { pageBlockDtoSchema, pageLayoutDtoSchema } from '@ecommerce-amazon/shared/cms';
import type { PageBlockDto, PageLayoutDto } from '@ecommerce-amazon/shared/cms';
import { publicCategoryTreeNodeSchema, type PublicCategoryTreeNode } from '@ecommerce-amazon/shared/category/category-schemas';
import { adminCollectionsResponseSchema } from '@ecommerce-amazon/shared/admin';

import type { AdminBlockInput, UpdateAdminBlockInput } from '@/lib/api/cms-pages';

const categoriesResponseSchema = z.object({
  items: z.array(publicCategoryTreeNodeSchema),
});

function flattenPublicCategories(
  items: PublicCategoryTreeNode[],
  prefix = '',
): Array<{ slug: string; label: string }> {
  return items.flatMap((item) => {
    const label = prefix ? `${prefix} → ${item.label}` : item.label;
    const current = { slug: item.slug, label };
    const children = item.subcategories
      ? flattenPublicCategories(item.subcategories, label)
      : [];
    return [current, ...children];
  });
}

function parseCategoriesPayload(payload: unknown): Array<{ slug: string; label: string }> {
  const parsed = categoriesResponseSchema.safeParse(payload);
  if (!parsed.success) return [];
  return flattenPublicCategories(parsed.data.items);
}

const productListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  marketplace: z.string(),
});

const adminProductsPageSchema = z.object({
  items: z.array(productListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type ProductPickerOption = z.infer<typeof productListItemSchema>;

const adminArticleSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
});

const adminArticlesResponseSchema = z.object({
  items: z.array(adminArticleSummarySchema),
});

export type AdminArticlePickerOption = z.infer<typeof adminArticleSummarySchema>;

export type AdminCollectionPickerOption = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
};

function readErrorMessage(payload: unknown): string {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'string') return error;
  }
  return 'Request failed';
}

async function clientFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload));
  }

  return response.json();
}

export async function fetchAdminPageLayoutClient(slug: string): Promise<PageLayoutDto> {
  const data = await clientFetch(`/api/admin/pages/${encodeURIComponent(slug)}`);
  return pageLayoutDtoSchema.parse(data);
}

export async function createPageBlockClient(
  slug: string,
  input: AdminBlockInput,
): Promise<PageBlockDto> {
  const data = await clientFetch(`/api/admin/pages/${encodeURIComponent(slug)}/blocks`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return pageBlockDtoSchema.parse(data);
}

export async function updatePageBlockClient(
  slug: string,
  blockId: string,
  input: UpdateAdminBlockInput,
): Promise<PageBlockDto> {
  const data = await clientFetch(
    `/api/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
  return pageBlockDtoSchema.parse(data);
}

export async function deletePageBlockClient(
  slug: string,
  blockId: string,
): Promise<PageBlockDto[]> {
  const data = await clientFetch(
    `/api/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
    {
      method: 'DELETE',
    },
  );
  return z.array(pageBlockDtoSchema).parse(data);
}

export async function reorderPageBlocksClient(
  slug: string,
  blocksOrder: Array<{ blockId: string; position: number }>,
): Promise<PageBlockDto[]> {
  const data = await clientFetch(
    `/api/admin/pages/${encodeURIComponent(slug)}/blocks/reorder`,
    {
      method: 'PATCH',
      body: JSON.stringify({ blocksOrder }),
    },
  );
  return z.array(pageBlockDtoSchema).parse(data);
}

export async function listCategoriesClient(): Promise<Array<{ slug: string; label: string }>> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';
  const response = await fetch(`${apiUrl}/categories`, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  return parseCategoriesPayload(payload);
}

export async function listProductsClient(
  params: { pageSize?: number } = {},
): Promise<ProductPickerOption[]> {
  const pageSize = params.pageSize ?? 50;
  const response = await fetch(`/api/admin/products?pageSize=${pageSize}`, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  const parsed = adminProductsPageSchema.safeParse(payload);
  if (!parsed.success) return [];
  return parsed.data.items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    marketplace: item.marketplace,
  }));
}

export async function listAdminCollectionsClient(): Promise<AdminCollectionPickerOption[]> {
  const response = await fetch('/api/admin/collections', { cache: 'no-store' });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  const parsed = adminCollectionsResponseSchema.safeParse(payload);
  if (!parsed.success) return [];
  return parsed.data.items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    coverImageUrl: item.coverImageUrl,
  }));
}

export async function listAdminArticlesClient(): Promise<AdminArticlePickerOption[]> {
  const response = await fetch('/api/admin/articles?picker=true', { cache: 'no-store' });
  if (!response.ok) return [];
  const payload: unknown = await response.json();
  const parsed = adminArticlesResponseSchema.safeParse(payload);
  if (!parsed.success) return [];
  return parsed.data.items;
}

export type { BlockType };
