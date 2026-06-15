import { randomUUID } from 'node:crypto';

import {
  EntityNotFoundError,
  Price,
  PriceSnapshot,
  SnapshotSource,
  ValidationError,
  type CacheInvalidator,
  type CategoryRepository,
  type PriceSnapshotRepository,
  type Product,
  type ProductRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { UpdateProductBody } from '@ecommerce-amazon/shared/admin';

import { assertCategoryIsLeaf } from '../category/category.helpers.js';
import {
  createAffiliateLink,
  filterNonEmptyStrings,
  parseProductAvailability,
  resolveEditorialContentFields,
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
    private readonly categoryRepository: CategoryRepository,
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly cacheInvalidator: CacheInvalidator,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(slug: string, input: UpdateProductBody): Promise<UpdateProductResult> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new EntityNotFoundError('Product', slug);
    }

    if (input.categoryId) {
      await assertCategoryIsLeaf(this.categoryRepository, input.categoryId);
    }

    const { marketplace, externalId } = resolveProductLink(input);
    if (marketplace !== product.marketplace || externalId !== product.externalId) {
      throw new ValidationError('Cannot change marketplace or external ID on update');
    }

    const now = new Date();
    const previousAmount = product.price.amount;
    const wasStale = product.price.isStale;
    const previousCategoryId = product.categoryId;
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

    const paths = [`/produtos/${product.slug}`];
    if (product.categoryId) {
      const category = await this.categoryRepository.findById(product.categoryId);
      if (category) {
        paths.push(`/categorias/${category.slug}`);
      }
    }
    if (previousCategoryId && previousCategoryId !== product.categoryId) {
      const previousCategory = await this.categoryRepository.findById(previousCategoryId);
      if (previousCategory) {
        paths.push(`/categorias/${previousCategory.slug}`);
      }
    }
    await this.webRevalidator.revalidate({ paths: [...new Set(paths)] });

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
    const editorialContent = resolveEditorialContentFields(input, filteredPros);

    product.titleClean = input.titleClean.trim();
    product.titleRaw = input.titleClean.trim();
    product.affiliateLink = createAffiliateLink(input);
    product.images = filteredImages;
    product.editorialScore = toStoredEditorialScore(input.editorialScore);
    product.availability = parseProductAvailability(input.availability);
    product.price = price;
    product.pros = filteredPros.length > 0 ? filteredPros : undefined;
    product.cons = filteredCons.length > 0 ? filteredCons : undefined;
    product.visible = input.visible;
    product.categoryId = input.categoryId;
    product.shortDescription = editorialContent.shortDescription;
    product.longDescriptionHtml = editorialContent.longDescriptionHtml;
    product.metaTitle = editorialContent.metaTitle;
    product.metaDescription = editorialContent.metaDescription;
    product.specsNormalized = input.specsNormalized ?? {};

    if (input.strikethroughPrice !== undefined && input.strikethroughPrice > 0) {
      product.strikethroughPrice = input.strikethroughPrice;
    } else {
      product.strikethroughPrice = undefined;
    }
  }
}
