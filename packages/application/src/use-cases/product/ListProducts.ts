import {
  PriceComplianceService,
  ProductSortField,
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
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(filters: {
    page?: number;
    pageSize?: number;
    category?: string;
    marketplace?: Marketplace;
    sort?: ProductSortField;
    minDiscountPercentage?: number;
  }): Promise<ListProductsResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const result = await this.productRepository.findPublished({ ...filters, page, pageSize });

    for (const product of result.items) {
      if (this.compliance.isStale(product.price.updatedAt)) {
        product.markPriceStale();
      }
    }

    return { ...result, page, pageSize };
  }
}
