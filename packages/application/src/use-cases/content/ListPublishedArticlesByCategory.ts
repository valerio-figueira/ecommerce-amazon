import { type ArticleCategoryRepository, type ContentRepository } from '@ecommerce-amazon/domain';

export class ListPublishedArticlesByCategory {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly articleCategoryRepository: ArticleCategoryRepository,
  ) {}

  async execute(categorySlug: string) {
    const category = await this.articleCategoryRepository.findBySlug(categorySlug);
    if (!category) return null;

    const items = await this.contentRepository.listPublishedByCategorySlug(categorySlug);

    return {
      category: {
        name: category.name,
        slug: category.slug,
      },
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        publishedAt: item.publishedAt?.toISOString() ?? null,
      })),
    };
  }
}
