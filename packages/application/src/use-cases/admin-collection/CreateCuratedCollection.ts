import { randomUUID } from 'node:crypto';

import {
  CuratedCollection,
  ValidationError,
  type CacheInvalidator,
  type CacheStore,
  type CuratedCollectionRepository,
} from '@ecommerce-amazon/domain';
import type { CreateCollectionBody } from '@ecommerce-amazon/shared/admin';

import { assertUniqueCollectionSlug } from './collection.helpers.js';

export class CreateCuratedCollection {
  constructor(
    private readonly collectionRepository: CuratedCollectionRepository,
    private readonly cache: CacheStore,
    private readonly cacheInvalidator: CacheInvalidator,
  ) {}

  async execute(input: CreateCollectionBody): Promise<{ id: string }> {
    await assertUniqueCollectionSlug(this.collectionRepository, input.slug);

    if (input.productIds.length === 0) {
      throw new ValidationError('At least one product is required');
    }

    const now = new Date();
    const collection = CuratedCollection.create({
      id: randomUUID(),
      slug: input.slug,
      title: input.title.trim(),
      description: input.description.trim(),
      coverImageUrl: input.coverImageUrl.trim(),
      campaignOrigin: input.campaignOrigin,
      utmDefaults: input.utmDefaults,
      productIds: input.productIds,
      ctaText: input.ctaText.trim(),
      createdAt: now,
      updatedAt: now,
    });

    await this.collectionRepository.save(collection);
    await this.invalidateCaches(collection);

    return { id: collection.id };
  }

  private async invalidateCaches(collection: CuratedCollection): Promise<void> {
    await this.cache.del(`vitrine:collection:slug:${collection.slug}`);
    await this.cacheInvalidator.invalidateProducts(collection.productIds);
  }
}

export class ListCuratedCollections {
  constructor(private readonly collectionRepository: CuratedCollectionRepository) {}

  async execute(): Promise<{
    items: {
      id: string;
      slug: string;
      title: string;
      coverImageUrl: string;
      productCount: number;
      updatedAt: string;
    }[];
  }> {
    const items = await this.collectionRepository.listAll();
    return {
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        productCount: item.productCount,
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }
}

export class ListPublicCollections {
  constructor(private readonly collectionRepository: CuratedCollectionRepository) {}

  async execute(): Promise<{
    items: { slug: string; title: string; coverImageUrl: string }[];
  }> {
    const items = await this.collectionRepository.listAll();
    return {
      items: items.map((item) => ({
        slug: item.slug,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
      })),
    };
  }
}

export class GetAdminCollection {
  constructor(private readonly collectionRepository: CuratedCollectionRepository) {}

  async execute(id: string) {
    const collection = await this.collectionRepository.findById(id);
    if (!collection) return null;

    return {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      coverImageUrl: collection.coverImageUrl,
      campaignOrigin: collection.campaignOrigin,
      utmDefaults: collection.utmDefaults,
      ctaText: collection.ctaText,
      productIds: collection.productIds,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
    };
  }
}
