import { EntityNotFoundError, type Product, type ProductRepository } from '@ecommerce-amazon/domain';

export class GetAdminProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: { slug: string }): Promise<Product> {
    const product = await this.productRepository.findBySlug(input.slug);
    if (!product) {
      throw new EntityNotFoundError('Product', input.slug);
    }
    return product;
  }
}
