import { PriceComplianceService, type Product } from '@ecommerce-amazon/domain';

export function applyPriceComplianceToProducts(
  products: Product[],
  compliance = new PriceComplianceService(),
): void {
  for (const product of products) {
    if (compliance.isStale(product.price.updatedAt)) {
      product.markPriceStale();
    }
  }
}

export function applyPriceComplianceToProduct(
  product: Product,
  compliance = new PriceComplianceService(),
): void {
  applyPriceComplianceToProducts([product], compliance);
}
