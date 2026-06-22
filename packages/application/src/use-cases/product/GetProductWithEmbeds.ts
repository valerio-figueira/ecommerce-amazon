import {
  PriceComplianceService,
  type Product,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import { extractAllEmbedSlugsFromBody } from '@ecommerce-amazon/shared/content';

export type ProductWithEmbedsResult = {
  product: Product;
  similarProducts: Product[];
  embeddedProducts: Record<string, Product | null>;
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

    const embedSlugs = product.longDescriptionHtml
      ? extractAllEmbedSlugsFromBody(product.longDescriptionHtml).filter(
          (embedSlug) => embedSlug !== product.slug,
        )
      : [];
    const embeddedProductResults = await Promise.all(
      embedSlugs.map(async (embedSlug) => {
        const embedded = await this.productRepository.findBySlug(embedSlug);
        if (!embedded) {
          return [embedSlug, null] as const;
        }
        if (this.compliance.isStale(embedded.price.updatedAt)) {
          embedded.markPriceStale();
        }
        return [embedSlug, embedded] as const;
      }),
    );
    const embeddedProducts = Object.fromEntries(embeddedProductResults);

    return { product, similarProducts, embeddedProducts };
  }
}
