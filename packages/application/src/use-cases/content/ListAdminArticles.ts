import type { ContentRepository } from '@ecommerce-amazon/domain';

export class ListAdminArticles {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(): Promise<{
    items: {
      id: string;
      slug: string;
      title: string;
    }[];
  }> {
    const items = await this.contentRepository.listPublishedSummaries();
    return { items };
  }
}
