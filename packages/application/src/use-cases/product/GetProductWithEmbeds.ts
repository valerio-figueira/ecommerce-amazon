import {
  PriceComplianceService,
  type Product,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

export type ProductWithEmbedsResult = {
  product: Product;
  similarProducts: Product[];
};

export class GetProductWithEmbeds {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(slug: string): Promise<ProductWithEmbedsResult | null> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) return null;

    if (this.compliance.isStale(product.price.updatedAt)) {
      product.markPriceStale();
    }

    let similarProducts: Product[] = [];
    if (product.categoryId) {
      similarProducts = await this.productRepository.findSimilarPublishedByCategory({
        categoryId: product.categoryId,
        excludeProductId: product.id,
        limit: 12,
      });

      for (const similar of similarProducts) {
        if (this.compliance.isStale(similar.price.updatedAt)) {
          similar.markPriceStale();
        }
      }
    }

    return { product, similarProducts };
  }
}
