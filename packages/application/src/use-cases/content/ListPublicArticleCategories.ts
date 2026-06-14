import type { ContentRepository } from '@ecommerce-amazon/domain';

export class ListPublicArticleCategories {
  constructor(private readonly contentRepository: ContentRepository) {}

  async execute() {
    const categories = await this.contentRepository.listPublishedArticleCategories();
    return { items: categories };
  }
}
