import {
  PriceComplianceService,
  ProductSortField,
  type CategoryRepository,
  type Marketplace,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export type ListProductsResult = {
  items: import('@ecommerce-amazon/domain').Product[];
  total: number;
  page: number;
  pageSize: number;
};

export class ListProducts {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(filters: {
    page?: number;
    pageSize?: number;
    category?: string;
    marketplace?: Marketplace;
    sort?: ProductSortField;
    minDiscountPercentage?: number;
    visibleOnly?: boolean;
    freshPriceOnly?: boolean;
  }): Promise<ListProductsResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    let categoryIds: string[] | undefined;
    if (filters.category) {
      const category = await this.categoryRepository.findBySlug(filters.category);
      if (category) {
        categoryIds = await this.categoryRepository.getDescendantIds(category.id);
      } else {
        categoryIds = [];
      }
    }

    const result = await this.productRepository.findPublished({
      page,
      pageSize,
      ...(categoryIds !== undefined ? { categoryIds } : {}),
      ...(filters.marketplace ? { marketplace: filters.marketplace } : {}),
      ...(filters.sort ? { sort: filters.sort } : {}),
      ...(filters.minDiscountPercentage !== undefined
        ? { minDiscountPercentage: filters.minDiscountPercentage }
        : {}),
      ...(filters.visibleOnly ? { visibleOnly: true } : {}),
      ...(filters.freshPriceOnly ? { freshPriceOnly: true } : {}),
    });

    for (const product of result.items) {
      if (this.compliance.isStale(product.price.updatedAt)) {
        product.markPriceStale();
      }
    }

    return { ...result, page, pageSize };
  }
}
