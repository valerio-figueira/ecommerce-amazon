import type { ContentRepository } from '@ecommerce-amazon/domain';

export type ListPublishedArticlesInput = {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export class ListPublishedArticles {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute(input: ListPublishedArticlesInput = {}) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 12;

    const result = await this.contentRepository.listPublishedArticles({
      page,
      limit,
      ...(input.categorySlug !== undefined ? { categorySlug: input.categorySlug } : {}),
      ...(input.search !== undefined ? { search: input.search } : {}),
    });

    return {
      items: result.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        coverImageUrl: item.coverImageUrl,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        category: item.category,
      })),
      total: result.total,
      page,
      limit,
    };
  }
}
