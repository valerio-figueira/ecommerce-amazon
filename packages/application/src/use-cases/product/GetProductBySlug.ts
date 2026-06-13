import {
  PriceComplianceService,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export class GetProductBySlug {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) return null;

    if (this.compliance.isStale(product.price.updatedAt)) {
      product.markPriceStale();
    }

    return product;
  }
}
