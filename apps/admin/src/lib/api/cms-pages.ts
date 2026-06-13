import { z } from 'zod';

import type { AdminPageSummary } from '@ecommerce-amazon/domain';
import { BlockType, PageStatus } from '@ecommerce-amazon/domain';
import { pageBlockDtoSchema, pageLayoutDtoSchema } from '@ecommerce-amazon/shared/cms';
import type { PageBlockDto, PageLayoutDto } from '@ecommerce-amazon/shared/cms';

import { adminFetchParsed } from './admin-fetch';

const adminPageSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  status: z.nativeEnum(PageStatus),
});

const adminPagesSchema = z.array(adminPageSummarySchema);

const categorySchema = z.object({
  slug: z.string(),
  label: z.string(),
});

export type AdminBlockInput = {
  type: BlockType;
  position: number;
  props: unknown;
  visibility?: 'all' | 'desktop' | 'mobile';
};

export type UpdateAdminBlockInput = {
  type?: BlockType;
  position?: number;
  props?: unknown;
  visibility?: 'all' | 'desktop' | 'mobile';
};

export async function listAdminPages(): Promise<AdminPageSummary[]> {
  return adminFetchParsed('/admin/pages', adminPagesSchema);
}

export async function getAdminPageLayout(slug: string): Promise<PageLayoutDto> {
  return adminFetchParsed(`/admin/pages/${encodeURIComponent(slug)}`, pageLayoutDtoSchema);
}

export async function createPageBlock(
  slug: string,
  input: AdminBlockInput,
): Promise<PageBlockDto> {
  return adminFetchParsed(
    `/admin/pages/${encodeURIComponent(slug)}/blocks`,
    pageBlockDtoSchema,
    { method: 'POST', body: input },
  );
}

export async function updatePageBlock(
  slug: string,
  blockId: string,
  input: UpdateAdminBlockInput,
): Promise<PageBlockDto> {
  return adminFetchParsed(
    `/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
    pageBlockDtoSchema,
    { method: 'PATCH', body: input },
  );
}

export async function deletePageBlock(
  slug: string,
  blockId: string,
): Promise<PageBlockDto[]> {
  return adminFetchParsed(
    `/admin/pages/${encodeURIComponent(slug)}/blocks/${blockId}`,
    z.array(pageBlockDtoSchema),
    { method: 'DELETE' },
  );
}

export async function reorderPageBlocks(
  slug: string,
  blocksOrder: Array<{ blockId: string; position: number }>,
): Promise<PageBlockDto[]> {
  return adminFetchParsed(
    `/admin/pages/${encodeURIComponent(slug)}/blocks/reorder`,
    z.array(pageBlockDtoSchema),
    { method: 'PATCH', body: { blocksOrder } },
  );
}

export async function listCategories(): Promise<Array<{ slug: string; label: string }>> {
  const apiUrl =
    process.env['NEXT_PUBLIC_API_URL'] ??
    process.env['API_INTERNAL_URL'] ??
    'http://localhost:3000';
  const response = await fetch(`${apiUrl}/categories`, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  const payload: unknown = await response.json();
  const parsed = z.array(categorySchema).safeParse(payload);
  return parsed.success ? parsed.data : [];
}
