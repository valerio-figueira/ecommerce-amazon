import { randomUUID } from 'node:crypto';

import {
  AffiliateLink,
  ConflictError,
  Price,
  PriceSnapshot,
  Product,
  ProductAvailability,
  SnapshotSource,
  ValidationError,
  parseMarketplace,
  type CacheInvalidator,
  type PriceSnapshotRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import type { CreateProductBody } from '@ecommerce-amazon/shared/admin';
import { parseMarketplaceProductUrl, slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

export type CreateProductResult = {
  id: string;
  slug: string;
};

export class CreateProduct {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly snapshotRepository: PriceSnapshotRepository,
    private readonly cacheInvalidator: CacheInvalidator,
  ) {}

  async execute(input: CreateProductBody): Promise<CreateProductResult> {
    const marketplace = parseMarketplace(input.marketplace);
    let externalId = input.externalId.trim();

    const parsedFromUrl = parseMarketplaceProductUrl(input.affiliateLink);
    if (parsedFromUrl) {
      if (parsedFromUrl.marketplace !== input.marketplace) {
        throw new ValidationError('Marketplace does not match affiliate link');
      }
      if (!externalId) {
        externalId = parsedFromUrl.externalId;
      } else if (externalId !== parsedFromUrl.externalId) {
        throw new ValidationError('External ID does not match affiliate link');
      }
    }

    if (!externalId) {
      throw new ValidationError('External ID is required');
    }

    const duplicate = await this.productRepository.findByExternalId(marketplace, externalId);
    if (duplicate) {
      throw new ConflictError('Product already exists for this marketplace and external ID');
    }

    const baseSlug = input.slug?.trim() || slugifyTitle(input.titleClean);
    if (!baseSlug) {
      throw new ValidationError('Could not generate a valid slug from title');
    }
    const slug = await this.resolveUniqueSlug(baseSlug);

    const now = new Date();
    const priceIsStale = !input.shouldShowPrice;
    const price = Price.create({
      amount: input.price,
      currency: 'BRL',
      updatedAt: now,
      isStale: priceIsStale,
    });

    const affiliateLink = AffiliateLink.create(input.affiliateLink, input.marketplace);

    const filteredPros = input.pros.map((item) => item.trim()).filter((item) => item.length > 0);
    const filteredCons = input.cons.map((item) => item.trim()).filter((item) => item.length > 0);
    const filteredImages = input.images.filter((url) => url.trim().length > 0);

    const productId = randomUUID();
    const editorialScoreStored = Math.round(input.editorialScore * 10);

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
      editorialScore: editorialScoreStored,
      availability: parseProductAvailability(input.availability),
      tags: [],
      ...(filteredPros.length > 0 ? { pros: filteredPros } : {}),
      ...(filteredCons.length > 0 ? { cons: filteredCons } : {}),
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

function parseProductAvailability(value: string): ProductAvailability {
  switch (value) {
    case 'in_stock':
      return ProductAvailability.IN_STOCK;
    case 'out_of_stock':
      return ProductAvailability.OUT_OF_STOCK;
    default:
      return ProductAvailability.UNKNOWN;
  }
}
