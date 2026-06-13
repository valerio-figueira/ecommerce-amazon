import { type ProductRepository } from '@ecommerce-amazon/domain';

const CATEGORY_LABELS: Record<string, string> = {
  'home-office': 'Home Office',
  games: 'Games',
  eletronicos: 'Eletrônicos',
};

export type ProductCategoryDto = {
  slug: string;
  label: string;
  count: number;
};

export class ListProductCategories {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<{ items: ProductCategoryDto[] }> {
    const categories = await this.productRepository.listCategories();
    return {
      items: categories.map((category) => ({
        slug: category.slug,
        label: CATEGORY_LABELS[category.slug] ?? category.slug,
        count: category.count,
      })),
    };
  }
}
