import { randomUUID } from 'node:crypto';

import {
  ContentCluster,
  EntityNotFoundError,
  type CacheStore,
  type ContentClusterRepository,
  type ContentRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type {
  CreateContentClusterBody,
  UpdateContentClusterBody,
} from '@ecommerce-amazon/shared/admin';

import {
  buildArticlePublicPaths,
  invalidateArticlePublicCache,
} from '../../cache/public-cache.helpers.js';
import {
  assertUniqueContentClusterSlug,
  invalidateClusterArticleCaches,
} from './content-cluster.helpers.js';

async function syncPilarArticleClusterId(
  contentClusterRepository: ContentClusterRepository,
  clusterId: string,
  previousPilarArticleId: string | null,
  nextPilarArticleId: string | null,
): Promise<void> {
  if (previousPilarArticleId && previousPilarArticleId !== nextPilarArticleId) {
    await contentClusterRepository.setArticleClusterId(previousPilarArticleId, null);
  }

  if (nextPilarArticleId) {
    await contentClusterRepository.setArticleClusterId(nextPilarArticleId, clusterId);
  }
}

export class CreateContentCluster {
  constructor(
    private readonly contentClusterRepository: ContentClusterRepository,
    private readonly contentRepository: ContentRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: CreateContentClusterBody): Promise<{ id: string }> {
    await assertUniqueContentClusterSlug(this.contentClusterRepository, input.slug);

    if (input.pilarArticleId) {
      const pilarArticle = await this.contentRepository.findArticleById(input.pilarArticleId);
      if (!pilarArticle) {
        throw new EntityNotFoundError('Article', input.pilarArticleId);
      }
    }

    const now = new Date();
    const cluster = ContentCluster.create({
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      pilarArticleId: input.pilarArticleId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await this.contentClusterRepository.save(cluster);

    if (cluster.pilarArticleId) {
      await syncPilarArticleClusterId(
        this.contentClusterRepository,
        cluster.id,
        null,
        cluster.pilarArticleId,
      );
      const slugs = await invalidateClusterArticleCaches(
        this.contentClusterRepository,
        this.cache,
        cluster.id,
      );
      await this.webRevalidator.revalidate({
        paths: buildArticlePublicPaths(slugs, { includeListing: true }),
      });
    }

    return { id: cluster.id };
  }
}

export class ListContentClustersAdmin {
  constructor(private readonly contentClusterRepository: ContentClusterRepository) {}

  async execute() {
    const items = await this.contentClusterRepository.listAdminSummaries();
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        pilarTitle: item.pilarTitle,
        memberCount: item.memberCount,
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }
}

export class GetContentClusterAdmin {
  constructor(private readonly contentClusterRepository: ContentClusterRepository) {}

  async execute(id: string) {
    const cluster = await this.contentClusterRepository.findById(id);
    if (!cluster) return null;

    const members = await this.contentClusterRepository.listAllMembers(id);

    return {
      id: cluster.id,
      name: cluster.name,
      slug: cluster.slug,
      description: cluster.description,
      pilarArticleId: cluster.pilarArticleId,
      members: members.map((member) => ({
        id: member.id,
        slug: member.slug,
        title: member.title,
        excerpt: member.excerpt,
        coverImageUrl: member.coverImageUrl,
        publishedAt: member.publishedAt?.toISOString() ?? null,
        status: member.status,
        isPilar: member.isPilar,
      })),
      createdAt: cluster.createdAt.toISOString(),
      updatedAt: cluster.updatedAt.toISOString(),
    };
  }
}

export class UpdateContentCluster {
  constructor(
    private readonly contentClusterRepository: ContentClusterRepository,
    private readonly contentRepository: ContentRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateContentClusterBody): Promise<void> {
    const cluster = await this.contentClusterRepository.findById(id);
    if (!cluster) {
      throw new EntityNotFoundError('ContentCluster', id);
    }

    const nextSlug = input.slug ?? cluster.slug;
    if (nextSlug !== cluster.slug) {
      await assertUniqueContentClusterSlug(this.contentClusterRepository, nextSlug, id);
    }

    const nextPilarArticleId =
      input.pilarArticleId !== undefined ? input.pilarArticleId : cluster.pilarArticleId;

    if (nextPilarArticleId) {
      const pilarArticle = await this.contentRepository.findArticleById(nextPilarArticleId);
      if (!pilarArticle) {
        throw new EntityNotFoundError('Article', nextPilarArticleId);
      }
    }

    const updated = cluster.withUpdates({
      ...(input.name !== undefined ? { name: input.name } : {}),
      slug: nextSlug,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.pilarArticleId !== undefined ? { pilarArticleId: input.pilarArticleId } : {}),
    });

    await this.contentClusterRepository.save(updated);
    await syncPilarArticleClusterId(
      this.contentClusterRepository,
      id,
      cluster.pilarArticleId,
      updated.pilarArticleId,
    );

    const slugs = await invalidateClusterArticleCaches(
      this.contentClusterRepository,
      this.cache,
      id,
    );
    await this.webRevalidator.revalidate({
      paths: buildArticlePublicPaths(slugs, { includeListing: true }),
    });
  }
}

export class DeleteContentCluster {
  constructor(
    private readonly contentClusterRepository: ContentClusterRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const cluster = await this.contentClusterRepository.findById(id);
    if (!cluster) {
      throw new EntityNotFoundError('ContentCluster', id);
    }

    const slugs = await this.contentClusterRepository.listMemberSlugs(id);
    await this.contentClusterRepository.delete(id);
    await invalidateArticlePublicCache(this.cache, slugs);
    await this.webRevalidator.revalidate({
      paths: buildArticlePublicPaths(slugs, { includeListing: true }),
    });
  }
}
