import { randomUUID } from 'node:crypto';

import {
  PriceSnapshot,
  Product,
  SnapshotSource,
  ValidationError,
  type CacheInvalidator,
  type CategoryRepository,
  type PriceSnapshotRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import type { CreateProductBody } from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

import {
  assertExternalIdAvailable,
  buildPriceFromForm,
  createAffiliateLink,
  filterNonEmptyStrings,
  parseProductAvailability,
  resolveProductLink,
  resolveEditorialContentFields,
  toStoredEditorialScore,
} from './product-form.helpers.js';
import { assertCategoryIsLeaf } from '../category/category.helpers.js';

export type CreateProductResult = {
  id: string;
  slug: string;
};

export class CreateProduct {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly cacheInvalidator: CacheInvalidator,
  ) {}

  async execute(input: CreateProductBody): Promise<CreateProductResult> {
    const { marketplace, externalId } = resolveProductLink(input);
    await assertExternalIdAvailable(this.productRepository, marketplace, externalId);

    if (input.categoryId) {
      await assertCategoryIsLeaf(this.categoryRepository, input.categoryId);
    }

    const baseSlug = input.slug?.trim() || slugifyTitle(input.titleClean);
    if (!baseSlug) {
      throw new ValidationError('Could not generate a valid slug from title');
    }
    const slug = await this.resolveUniqueSlug(baseSlug);

    const now = new Date();
    const price = buildPriceFromForm(input, { updatedAt: now });
    const affiliateLink = createAffiliateLink(input);

    const filteredPros = filterNonEmptyStrings(input.pros);
    const filteredCons = filterNonEmptyStrings(input.cons);
    const filteredImages = filterNonEmptyStrings(input.images);
    const editorialContent = resolveEditorialContentFields(input, filteredPros);

    const productId = randomUUID();

    const product = Product.create({
      id: productId,
      marketplace,
      externalId,
      slug,
      titleClean: input.titleClean.trim(),
      titleRaw: input.titleClean.trim(),
      price,
      ...(input.strikethroughPrice !== undefined && input.strikethroughPrice > 0
        ? { strikethroughPrice: input.strikethroughPrice }
        : {}),
      affiliateLink,
      images: filteredImages,
      specsNormalized: {},
      editorialScore: toStoredEditorialScore(input.editorialScore),
      availability: parseProductAvailability(input.availability),
      tags: [],
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(editorialContent.shortDescription !== undefined
        ? { shortDescription: editorialContent.shortDescription }
        : {}),
      ...(editorialContent.longDescriptionHtml !== undefined
        ? { longDescriptionHtml: editorialContent.longDescriptionHtml }
        : {}),
      ...(editorialContent.metaTitle !== undefined ? { metaTitle: editorialContent.metaTitle } : {}),
      ...(editorialContent.metaDescription !== undefined
        ? { metaDescription: editorialContent.metaDescription }
        : {}),
      ...(filteredPros.length > 0 ? { pros: filteredPros } : {}),
      ...(filteredCons.length > 0 ? { cons: filteredCons } : {}),
      visible: input.visible,
      createdAt: now,
    });

    await this.productRepository.save(product);

    if (input.price > 0) {
      await this.snapshotRepository.insertBatch([
        PriceSnapshot.create({
          id: randomUUID(),
          productId,
          amount: input.price,
          currency: 'BRL',
          source: SnapshotSource.MANUAL_OVERRIDE,
          capturedAt: now,
        }),
      ]);
    }

    await this.cacheInvalidator.invalidateProducts([productId]);

    return { id: productId, slug };
  }

  private async resolveUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let suffix = 2;

    while (await this.productRepository.findBySlug(candidate)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }
}
