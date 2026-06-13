import { randomUUID } from 'node:crypto';

import {
  EntityNotFoundError,
  Price,
  PriceSnapshot,
  SnapshotSource,
  ValidationError,
  type CacheInvalidator,
  type PriceSnapshotRepository,
  type Product,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import type { UpdateProductBody } from '@ecommerce-amazon/shared/admin';

import {
  createAffiliateLink,
  filterNonEmptyStrings,
  parseProductAvailability,
  resolveProductLink,
  toStoredEditorialScore,
} from './product-form.helpers.js';

export type UpdateProductResult = {
  id: string;
  slug: string;
};

export class UpdateProduct {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly cacheInvalidator: CacheInvalidator,
  ) {}

  async execute(slug: string, input: UpdateProductBody): Promise<UpdateProductResult> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new EntityNotFoundError('Product', slug);
    }

    const { marketplace, externalId } = resolveProductLink(input);
    if (marketplace !== product.marketplace || externalId !== product.externalId) {
      throw new ValidationError('Cannot change marketplace or external ID on update');
    }

    const now = new Date();
    const previousAmount = product.price.amount;
    const wasStale = product.price.isStale;
    const price = this.buildUpdatedPrice(product, input, now);

    this.applyFormFields(product, input, price);

    await this.productRepository.save(product);

    const priceBecameVisible = input.shouldShowPrice && (wasStale || previousAmount !== input.price);
    if (input.price > 0 && input.shouldShowPrice && priceBecameVisible) {
      await this.snapshotRepository.insertBatch([
        PriceSnapshot.create({
          id: randomUUID(),
          productId: product.id,
          amount: input.price,
          currency: 'BRL',
          source: SnapshotSource.MANUAL_OVERRIDE,
          capturedAt: now,
        }),
      ]);
    }

    await this.cacheInvalidator.invalidateProducts([product.id]);

    return { id: product.id, slug: product.slug };
  }

  private buildUpdatedPrice(
    product: Product,
    input: UpdateProductBody,
    now: Date,
  ): ReturnType<typeof Price.create> {
    const priceIsStale = !input.shouldShowPrice;

    if (priceIsStale) {
      return Price.create({
        amount: input.price,
        currency: 'BRL',
        updatedAt: product.price.updatedAt,
        isStale: true,
      });
    }

    const priceChanged = product.price.amount !== input.price || product.price.isStale;
    return Price.create({
      amount: input.price,
      currency: 'BRL',
      updatedAt: priceChanged ? now : product.price.updatedAt,
      isStale: false,
    });
  }

  private applyFormFields(product: Product, input: UpdateProductBody, price: Price): void {
    const filteredPros = filterNonEmptyStrings(input.pros);
    const filteredCons = filterNonEmptyStrings(input.cons);
    const filteredImages = filterNonEmptyStrings(input.images);

    product.titleClean = input.titleClean.trim();
    product.titleRaw = input.titleClean.trim();
    product.affiliateLink = createAffiliateLink(input);
    product.images = filteredImages;
    product.editorialScore = toStoredEditorialScore(input.editorialScore);
    product.availability = parseProductAvailability(input.availability);
    product.price = price;
    product.pros = filteredPros.length > 0 ? filteredPros : undefined;
    product.cons = filteredCons.length > 0 ? filteredCons : undefined;

    if (input.strikethroughPrice !== undefined && input.strikethroughPrice > 0) {
      product.strikethroughPrice = input.strikethroughPrice;
    } else {
      product.strikethroughPrice = undefined;
    }
  }
}
