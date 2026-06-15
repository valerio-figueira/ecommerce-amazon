import {
  CuratedCollection,
  EntityNotFoundError,
  ValidationError,
  type CacheInvalidator,
  type CacheStore,
  type CuratedCollectionRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { UpdateCollectionBody } from '@ecommerce-amazon/shared/admin';

import { assertUniqueCollectionSlug } from './collection.helpers.js';

export class UpdateCuratedCollection {
  constructor(
    private readonly collectionRepository: CuratedCollectionRepository,
    private readonly cache: CacheStore,
    private readonly cacheInvalidator: CacheInvalidator,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateCollectionBody): Promise<void> {
    const existing = await this.collectionRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('CuratedCollection', id);
    }

    if (input.slug !== undefined && input.slug !== existing.slug) {
      await assertUniqueCollectionSlug(this.collectionRepository, input.slug, id);
    }

    if (input.productIds !== undefined && input.productIds.length === 0) {
      throw new ValidationError('At least one product is required');
    }

    const previousSlug = existing.slug;
    const previousProductIds = existing.productIds;

    const collection = CuratedCollection.create({
      id: existing.id,
      slug: input.slug ?? existing.slug,
      title: input.title?.trim() ?? existing.title,
      description: input.description?.trim() ?? existing.description,
      coverImageUrl: input.coverImageUrl?.trim() ?? existing.coverImageUrl,
      campaignOrigin: input.campaignOrigin ?? existing.campaignOrigin,
      utmDefaults: input.utmDefaults ?? existing.utmDefaults,
      productIds: input.productIds ?? existing.productIds,
      ctaText: input.ctaText?.trim() ?? existing.ctaText,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.collectionRepository.save(collection);

    await this.cache.del(`vitrine:collection:slug:${previousSlug}`);
    if (collection.slug !== previousSlug) {
      await this.cache.del(`vitrine:collection:slug:${collection.slug}`);
    }

    const allProductIds = [...new Set([...previousProductIds, ...collection.productIds])];
    await this.cacheInvalidator.invalidateProducts(allProductIds);
    await this.webRevalidator.revalidate({
      paths: [...new Set([`/colecoes/${previousSlug}`, `/colecoes/${collection.slug}`, '/'])],
    });
  }
}

export class DeleteCuratedCollection {
  constructor(
    private readonly collectionRepository: CuratedCollectionRepository,
    private readonly cache: CacheStore,
    private readonly cacheInvalidator: CacheInvalidator,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const collection = await this.collectionRepository.findById(id);
    if (!collection) {
      throw new EntityNotFoundError('CuratedCollection', id);
    }

    await this.collectionRepository.delete(id);
    await this.cache.del(`vitrine:collection:slug:${collection.slug}`);
    await this.cacheInvalidator.invalidateProducts(collection.productIds);
    await this.webRevalidator.revalidate({
      paths: [`/colecoes/${collection.slug}`, '/'],
    });
  }
}
