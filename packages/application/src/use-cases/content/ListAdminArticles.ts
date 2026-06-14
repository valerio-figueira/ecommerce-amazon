import {
  ArticleStatus,
  type AutoLinkRepository,
  type CacheStore,
  type ContentRepository,
} from '@ecommerce-amazon/domain';

export class ListAdminArticles {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(status?: ArticleStatus): Promise<{
    items: {
      id: string;
      slug: string;
      title: string;
      excerpt: string;
      status: ArticleStatus;
      coverImageUrl: string | null;
      updatedAt: string;
    }[];
  }> {
    const items = await this.contentRepository.listAdminSummaries(status);
    return {
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        status: item.status,
        coverImageUrl: item.coverImageUrl,
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  async executePublishedPicker(): Promise<{
    items: { id: string; slug: string; title: string }[];
  }> {
    const items = await this.contentRepository.listPublishedSummaries();
    return { items };
  }
}
