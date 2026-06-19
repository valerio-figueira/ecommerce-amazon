import {
  ArticleStatus,
  type ContentRepository,
} from '@ecommerce-amazon/domain';

export class ListAdminArticles {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(filters: {
    status?: ArticleStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: {
      id: string;
      slug: string;
      title: string;
      excerpt: string;
      status: ArticleStatus;
      coverImageUrl: string | null;
      updatedAt: string;
    }[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const result = await this.contentRepository.listAdminArticles({
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.search !== undefined && filters.search.length > 0
        ? { search: filters.search }
        : {}),
      page,
      pageSize,
    });

    return {
      items: result.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        status: item.status,
        coverImageUrl: item.coverImageUrl,
        updatedAt: item.updatedAt.toISOString(),
      })),
      total: result.total,
      page,
      pageSize,
    };
  }

  async executePublishedPicker(): Promise<{
    items: { id: string; slug: string; title: string }[];
  }> {
    const items = await this.contentRepository.listPublishedSummaries();
    return { items };
  }
}
