import type { SitemapRepository } from '@ecommerce-amazon/domain';

export const DEFAULT_SITEMAP_PAGE_SIZE = 50_000;
export const MAX_SITEMAP_PAGE_SIZE = 50_000;

export type SitemapEntryDto = {
  path: string;
  lastModified: string;
};

export type GetSitemapMetaInput = {
  pageSize?: number;
};

export type GetSitemapMetaResult = {
  totalEntries: number;
  pageSize: number;
  totalPages: number;
};

export class GetSitemapMeta {
  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async execute(input: GetSitemapMetaInput = {}): Promise<GetSitemapMetaResult> {
    const pageSize = normalizePageSize(input.pageSize);
    const totalEntries = await this.sitemapRepository.countEntries();
    const totalPages = totalEntries === 0 ? 1 : Math.ceil(totalEntries / pageSize);

    return {
      totalEntries,
      pageSize,
      totalPages,
    };
  }
}

export type ListSitemapEntriesInput = {
  page?: number;
  pageSize?: number;
};

export type ListSitemapEntriesResult = {
  page: number;
  pageSize: number;
  items: SitemapEntryDto[];
};

export class ListSitemapEntries {
  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async execute(input: ListSitemapEntriesInput = {}): Promise<ListSitemapEntriesResult> {
    const pageSize = normalizePageSize(input.pageSize);
    const page = normalizePage(input.page);
    const offset = (page - 1) * pageSize;

    const rows = await this.sitemapRepository.listEntries(offset, pageSize);

    return {
      page,
      pageSize,
      items: rows.map((row) => ({
        path: row.path,
        lastModified: row.lastModified.toISOString(),
      })),
    };
  }
}

function normalizePageSize(pageSize: number | undefined): number {
  if (pageSize === undefined || !Number.isFinite(pageSize) || pageSize <= 0) {
    return DEFAULT_SITEMAP_PAGE_SIZE;
  }
  return Math.min(Math.floor(pageSize), MAX_SITEMAP_PAGE_SIZE);
}

function normalizePage(page: number | undefined): number {
  if (page === undefined || !Number.isFinite(page) || page <= 0) {
    return 1;
  }
  return Math.floor(page);
}
