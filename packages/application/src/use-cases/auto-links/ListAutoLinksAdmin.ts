import type { AutoLinkRepository } from '@ecommerce-amazon/domain';
import type { ListAutoLinksQuery } from '@ecommerce-amazon/shared/admin';

export class ListAutoLinksAdmin {
  constructor(private readonly autoLinkRepository: AutoLinkRepository) {}

  async execute(query: ListAutoLinksQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.autoLinkRepository.listPaginated({
      page,
      limit,
      ...(query.search !== undefined ? { search: query.search } : {}),
    });

    return {
      items: result.items.map((item) => ({
        id: item.id,
        keyword: item.keyword,
        targetUrl: item.targetUrl,
        maxMatches: item.maxMatches,
        priority: item.priority,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      total: result.total,
      page,
      limit,
    };
  }
}
